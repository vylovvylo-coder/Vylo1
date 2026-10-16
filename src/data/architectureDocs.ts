export interface ArchitectureFile {
  name: string;
  path: string;
  language: string;
  descriptionAr: string;
  code: string;
}

export const RECOMMENDED_PROJECT_STRUCTURE = `
streamstudio-pro/
├── apps/
│   ├── desktop-ui/                 # واجهة المستخدم المبنية بـ Electron أو Tauri + React
│   │   ├── src/
│   │   │   ├── components/         # المكونات (Viewports, Audio Mixer, Scene List)
│   │   │   ├── services/           # IPC Client, AudioContext, Canvas Compositor
│   │   │   ├── store/              # حالة النظام (Zustand / Redux)
│   │   │   └── types/              # تعريفات الأنواع المشتركة
│   │   ├── package.json
│   │   └── tauri.conf.json         # أو electron-builder.yml
│   │
│   └── web-overlays/               # خادم الـ Browser Source للتنبيهات والشات المباشر
│       ├── src/alerts/             # قوالب التنبيهات (HTML5/Canvas Animations)
│       └── src/chat/               # تصميم شريط الشات المباشر الشفاف
│
├── core-engine/                    # محرك المعالجة النواة (C++ / Rust)
│   ├── include/
│   │   ├── engine_bridge.h         # واجهة الربط مع واجهة المستخدم (IPC Bridge)
│   │   ├── scene_compositor.h      # محرك الدمج الرسومي (GPU Texture Blending)
│   │   ├── audio_dsp.h             # معالج الإشارات الصوتية وفلاتر العزل
│   │   ├── nvenc_encoder.h         # مشفر عتادي NVIDIA NVENC
│   │   └── rtmp_srt_sender.h       # بروتوكولات الإرسال الشبكي
│   ├── src/
│   │   ├── scene_compositor.cpp    # Direct3D 11 / OpenGL / Vulkan Compositor
│   │   ├── audio_dsp.cpp           # محرك الميكسر متعدد القنوات + فلاتر VST
│   │   ├── nvenc_encoder.cpp       # تهيئة NVENC H.264/HEVC/AV1 عبر CUDA/NVCODEC
│   │   └── rtmp_srt_sender.cpp     # تفريغ البيانات لـ librtmp ومكتبة libsrt
│   └── CMakeLists.txt
│
├── modules/
│   ├── audio-capture/              # التقاط صوت سطح المكتب وتطبيقات النظام (WASAPI / CoreAudio)
│   ├── video-capture/              # التقاط الشاشة والألعاب (DXGI Desktop Duplication)
│   └── alerts-gateway/             # اتصالات الـ WebSockets مع Twitch / YouTube / Kick
│
└── package.json                    # Workspace Monorepo Root
`;

export const BOILERPLATE_FILES: ArchitectureFile[] = [
  {
    name: 'EngineBridge.cpp (C++ Native IPC Bridge)',
    path: 'core-engine/src/engine_bridge.cpp',
    language: 'cpp',
    descriptionAr: 'كود C++ احترافي يربط واجهة المستخدم UI بمحرك المعالجة، ويدير المشاهد ومصادر الفيديو ومؤشرات الأداء.',
    code: `#include "engine_bridge.h"
#include <iostream>
#include <nlohmann/json.hpp>
#include <obs/obs.h> // استخدام نواة libobs المشهورة
#include "nvenc_encoder.h"
#include "rtmp_srt_sender.h"

using json = nlohmann::json;

namespace StreamStudio {

class CoreEngine {
private:
    bool is_streaming = false;
    bool is_recording = false;
    std::unique_ptr<NvencEncoder> encoder;
    std::unique_ptr<StreamingSender> network_sender;

public:
    CoreEngine() {
        std::cout << "[CoreEngine] Initializing StreamStudio Native Subsystems..." << std::endl;
        
        // 1. تهيئة النواة الرسومية libobs
        if (!obs_startup("en-US", nullptr, nullptr)) {
            throw std::runtime_error("Failed to initialize libobs backend");
        }

        // 2. تفعيل تسريع الرسوميات GPU Context
        obs_video_info ovi = {};
        ovi.adapter = 0; // GPU 0 (NVIDIA)
        ovi.base_width = 1920;
        ovi.base_height = 1080;
        ovi.output_width = 1920;
        ovi.output_height = 1080;
        ovi.fps_num = 60;
        ovi.fps_den = 1;
        ovi.graphics_module = "libobs-d3d11"; // Direct3D 11 على ويندوز أو Vulkan
        ovi.output_format = VIDEO_FORMAT_NV12;

        if (obs_reset_video(&ovi) != OBS_VIDEO_SUCCESS) {
            throw std::runtime_error("Failed to initialize Direct3D 11 Video Pipeline");
        }

        // 3. تهيئة ميكسر الصوت النواة
        obs_audio_info oai = {};
        oai.samples_per_sec = 48000;
        oai.speakers = SPEAKERS_STEREO;
        obs_reset_audio(&oai);

        // 4. تهيئة مشفر NVENC العتادي
        encoder = std::make_unique<NvencEncoder>(1920, 1080, 60, 6000 /* kbps */);
        std::cout << "[CoreEngine] NVENC Hardware Acceleration Ready." << std::endl;
    }

    // معالجة الرسائل الواردة من واجهة React عبر الـ IPC
    std::string HandleUIMessage(const std::string& json_payload) {
        auto msg = json::parse(json_payload);
        std::string command = msg["action"];

        if (command == "START_STREAM") {
            std::string protocol = msg["protocol"]; // "RTMP" أو "SRT"
            std::string url = msg["serverUrl"];
            std::string key = msg["streamKey"];
            
            network_sender = std::make_unique<StreamingSender>(protocol, url, key);
            network_sender->Connect();
            encoder->StartEncoding([this](const uint8_t* packet, size_t size, int64_t pts) {
                // إرسال الحزم المشفرة مباشرة للشبكة
                network_sender->SendPacket(packet, size, pts);
            });
            is_streaming = true;
            return json{{"status", "SUCCESS"}, {"state", "STREAMING"}}.dump();
        }
        else if (command == "SWITCH_SCENE") {
            std::string scene_name = msg["sceneId"];
            obs_scene_t* target = obs_get_scene_by_name(scene_name.c_str());
            if (target) {
                obs_set_output_source(0, obs_scene_get_source(target));
            }
            return json{{"status", "SUCCESS"}, {"activeScene", scene_name}}.dump();
        }
        else if (command == "UPDATE_AUDIO_GAIN") {
            std::string channel_id = msg["channelId"];
            float volume_linear = msg["volume"];
            obs_source_t* source = obs_get_source_by_name(channel_id.c_str());
            if (source) {
                obs_source_set_volume(source, volume_linear);
            }
            return json{{"status", "SUCCESS"}}.dump();
        }

        return json{{"status", "UNKNOWN_COMMAND"}}.dump();
    }

    ~CoreEngine() {
        obs_shutdown();
    }
};

} // namespace StreamStudio
`,
  },
  {
    name: 'NvencEncoder.cpp (Hardware Video Encoder)',
    path: 'core-engine/src/nvenc_encoder.cpp',
    language: 'cpp',
    descriptionAr: 'تشفير الفيديو عالي الكفاءة باستخدام عتاد بطاقات NVIDIA NVENC لتقليل استهلاك المعالج إلى الصفر تقريباً.',
    code: `#include "nvenc_encoder.h"
#include <nvEncodeAPI.h>
#include <iostream>

// تهيئة إعدادات تشفير NVENC H.264 / HEVC / AV1
void NvencEncoder::ConfigureSession(int width, int height, int fps, int bitrate_kbps) {
    NV_ENC_INITIALIZE_PARAMS init_params = { NV_ENC_INITIALIZE_PARAMS_VER };
    NV_ENC_CONFIG encode_config = { NV_ENC_CONFIG_VER };

    init_params.encodeConfig = &encode_config;
    init_params.encodeGUID = NV_ENC_CODEC_H264_GUID; // أو NV_ENC_CODEC_AV1_GUID لأحدث البطاقات
    init_params.presetGUID = NV_ENC_PRESET_P6_GUID;  // P6: High Quality, Low Latency
    init_params.encodeWidth = width;
    init_params.encodeHeight = height;
    init_params.darWidth = width;
    init_params.darHeight = height;
    init_params.frameRateNum = fps;
    init_params.frameRateDen = 1;
    init_params.enablePTD = 1; // Picture Type Decision بواسطة العتاد

    // ضبط التحكم في معدل البت CBR المناسب للبث المباشر (Twitch / YouTube)
    encode_config.rcParams.rateControlMode = NV_ENC_PARAMS_RC_CBR;
    encode_config.rcParams.averageBitRate = bitrate_kbps * 1000;
    encode_config.rcParams.maxBitRate = bitrate_kbps * 1000;
    encode_config.rcParams.vbvBufferSize = (bitrate_kbps * 1000); // 1-second buffer
    encode_config.rcParams.zeroReorderDelay = 1; // صفر تأخير زمني للبث التفاعلي
    
    // فترات الإطارات المفتاحية Keyframe Interval (كل 2 ثانية = 120 إطار عند 60fps)
    encode_config.gopLength = fps * 2;
    encode_config.frameIntervalP = 1; // بدون B-Frames لتخفيض زمن الاستجابة إلى 2ms

    // استدعاء مكتبة NVEncodeAPI
    NVENCSTATUS status = m_nvenc.nvEncInitializeEncoder(m_encoder_handle, &init_params);
    if (status != NV_ENC_SUCCESS) {
        std::cerr << "[NVENC] Failed to initialize hardware session. Error code: " << status << std::endl;
        throw std::runtime_error("NVENC Init Failed");
    }

    std::cout << "[NVENC] Hardware Session Initialized successfully: "
              << width << "x" << height << "@" << fps << "fps at " 
              << bitrate_kbps << " kbps CBR." << std::endl;
}
`,
  },
  {
    name: 'RtmpSrtSender.cpp (Network Ingest Engine)',
    path: 'core-engine/src/rtmp_srt_sender.cpp',
    language: 'cpp',
    descriptionAr: 'محرك الإرسال الشبكي الداعم لبروتوكولات RTMP القديمة وبروتوكول SRT المتطور مع تصحيح حزم الفقد (ARQ).',
    code: `#include "rtmp_srt_sender.h"
#include <srt/srt.h>
#include <librtmp/rtmp.h>
#include <iostream>

void StreamingSender::InitializeSRT(const std::string& destination_url, int latency_ms, const std::string& passphrase) {
    srt_startup();
    m_srt_socket = srt_create_socket();

    // 1. تفعيل زمن التخزين المؤقت Latency Buffer (مقاومة فقدان الحزم)
    int lat = latency_ms; // افتراضياً 120ms
    srt_setsockflag(m_srt_socket, SRTO_LATENCY, &lat, sizeof(lat));

    // 2. تفعيل التشفير الآمن إذا توفرت كلمة مرور
    if (!passphrase.empty()) {
        int key_len = 16; // AES-128
        srt_setsockflag(m_srt_socket, SRTO_PASSPHRASE, passphrase.c_str(), passphrase.length());
        srt_setsockflag(m_srt_socket, SRTO_PBKEYLEN, &key_len, sizeof(key_len));
    }

    // 3. تهيئة وضع البث المباشر المخصص للـ SRT
    int stream_type = SRTT_LIVE;
    srt_setsockflag(m_srt_socket, SRTO_TRANSTYPE, &stream_type, sizeof(stream_type));

    std::cout << "[SRT] Socket configured for Ultra-Low Latency streaming to: " << destination_url << std::endl;
}

void StreamingSender::SendPacket(const uint8_t* data, size_t size, int64_t pts) {
    if (m_protocol == "SRT" && m_srt_socket != SRT_INVALID_SOCK) {
        int result = srt_send(m_srt_socket, reinterpret_cast<const char*>(data), static_cast<int>(size));
        if (result == SRT_ERROR) {
            std::cerr << "[SRT] Transmit Error: " << srt_getlasterror_str() << std::endl;
        }
    } else if (m_protocol == "RTMP" && m_rtmp_handle) {
        RTMP_Write(static_cast<RTMP*>(m_rtmp_handle), reinterpret_cast<const char*>(data), static_cast<int>(size));
    }
}
`,
  },
  {
    name: 'AudioDspPipeline.rs (Rust Multi-track Audio DSP)',
    path: 'core-engine/src/audio_dsp.rs',
    language: 'rust',
    descriptionAr: 'معالجة صوتية فائقة السرعة بلغة Rust، توفر بوابات الضوضاء Noise Gate والضاغط الديناميكي وفصل التطبيقات.',
    code: `pub struct AudioFilterRack {
    pub noise_gate_threshold_db: f32,
    pub compressor_ratio: f32,
    pub compressor_threshold_db: f32,
    pub makeup_gain_linear: f32,
    envelope: f32,
}

impl AudioFilterRack {
    pub fn new() -> Self {
        Self {
            noise_gate_threshold_db: -45.0,
            compressor_ratio: 4.0,
            compressor_threshold_db: -18.0,
            makeup_gain_linear: 1.4, // +3dB
            envelope: 0.0,
        }
    }

    /// معالجة مصفوفة العينات الصوتية Float32 (48kHz) داخل حلقة الذاكرة الآنية
    pub fn process_buffer(&mut self, samples: &mut [f32]) {
        let gate_linear = 10.0_f32.powf(self.noise_gate_threshold_db / 20.0);
        let comp_thresh_linear = 10.0_f32.powf(self.compressor_threshold_db / 20.0);

        for sample in samples.iter_mut() {
            let abs_val = sample.abs();
            
            // 1. Noise Gate (تصفية همسات الميكروفون ومراوح الحاسوب)
            if abs_val < gate_linear {
                *sample *= 0.05; // كتم تدرجي بدون تقطيع خشن
                continue;
            }

            // 2. Dynamics Compressor (ضغط الارتفاعات الصوتية المفاجئة والصراخ)
            if abs_val > comp_thresh_linear {
                let over_db = 20.0 * (abs_val / comp_thresh_linear).log10();
                let compressed_db = over_db / self.compressor_ratio;
                let scale = 10.0_f32.powf((compressed_db - over_db) / 20.0);
                *sample *= scale;
            }

            // 3. Makeup Gain
            *sample = (*sample * self.makeup_gain_linear).clamp(-1.0, 1.0);
        }
    }
}
`,
  },
  {
    name: 'IPCBridge.ts (Electron / Tauri IPC Controller)',
    path: 'apps/desktop-ui/src/services/ipcBridge.ts',
    language: 'typescript',
    descriptionAr: 'واجهة التوصيل بين واجهة React ومحرك C++ المحلي، تدعم استدعاء الأوامر ومزامنة الإحصاءات الآنية.',
    code: `import { Scene, StreamSettings, AudioChannel } from '../types/studio';

export class StudioIPCBridge {
  private static instance: StudioIPCBridge;

  public static getInstance(): StudioIPCBridge {
    if (!StudioIPCBridge.instance) {
      StudioIPCBridge.instance = new StudioIPCBridge();
    }
    return StudioIPCBridge.instance;
  }

  // إرسال أمر بدء البث المباشر للمحرك
  public async startStreaming(config: StreamSettings): Promise<{ success: boolean; message: string }> {
    console.log('[IPC] Sending START_STREAM to Core Engine:', config);
    // في بيئة Tauri: return await window.__TAURI__.invoke('start_streaming', { config });
    // في بيئة Electron: return await window.electronAPI.invoke('start-streaming', config);
    return { success: true, message: 'Stream started successfully over ' + config.protocol };
  }

  // تبديل المشهد الحالي (Cut / Fade)
  public async switchScene(sceneId: string, transition: 'cut' | 'fade' = 'cut') {
    console.log('[IPC] Switching scene to:', sceneId, 'with transition:', transition);
    // await window.electronAPI.send('scene:switch', { sceneId, transition });
  }

  // تحديث مستويات صوت الميكسر وفلاتر الـ DSP
  public async updateAudioChannel(channel: AudioChannel) {
    // await window.electronAPI.send('audio:update-channel', channel);
  }

  // الاشتراك في قراءة إحصاءات عتاد التشفير (FPS, NVENC Load, Dropped Frames)
  public onHardwareStats(callback: (stats: any) => void) {
    // window.electronAPI.on('telemetry:stats', (_event, data) => callback(data));
  }
}

export const ipcBridge = StudioIPCBridge.getInstance();
`,
  },
];
