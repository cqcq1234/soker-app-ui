import SwiftUI
import WebKit

@main
struct SokerApp: App {
    @StateObject private var chat = ChatBridge()
    @AppStorage("soker.demo.signedIn") private var signedIn = false
    @State private var showLogin = ProcessInfo.processInfo.arguments.contains("--show-login")

    var body: some Scene {
        WindowGroup {
            if !signedIn || showLogin {
                DemoLoginView {
                    signedIn = true
                    showLogin = false
                }
                .preferredColorScheme(.light)
            } else {
                chatSurface
            }
        }
    }

    private var chatSurface: some View {
        WebSurface(chat: chat)
                .ignoresSafeArea(.container)
                .safeAreaInset(edge: .bottom, spacing: 0) {
                    if chat.ready && !chat.menuOpen {
                        HStack(spacing: 10) {
                            TextField(chat.reviewing ? "问问今天该跟进谁" : "描述你想找的客户", text: $chat.draft)
                                .onSubmit(chat.send)
                            Button(action: chat.send) {
                                Image(systemName: "arrow.up.circle.fill")
                                    .font(.system(size: 26))
                            }
                            .accessibilityLabel("发送")
                            .disabled(chat.sending || chat.draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        }
                        .padding(.horizontal, 16)
                        .frame(height: 48)
                        .background(.regularMaterial, in: Capsule())
                        .padding(.horizontal, 16)
                        .padding(.bottom, 10)
                    }
                }
                .alert("此功能需要企业服务", isPresented: $chat.showServiceMessage) {
                    Button("好", role: .cancel) {}
                }
    }
}

private struct DemoLoginView: View {
    let onLogin: () -> Void
    private let blue = Color(red: 33 / 255, green: 77 / 255, blue: 163 / 255)

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 14) {
                    Image("SokerBrand")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 56, height: 56)
                        .padding(10)
                        .background(Color(red: 0.94, green: 0.95, blue: 0.97), in: RoundedRectangle(cornerRadius: 22))
                        .accessibilityHidden(true)
                    Text("登录 Soker")
                        .font(.largeTitle.weight(.semibold))
                        .accessibilityAddTraits(.isHeader)
                    Text("登录后进入盘客，连接微信并选择要关注的客户。")
                        .font(.body)
                        .foregroundStyle(Color(red: 83 / 255, green: 96 / 255, blue: 120 / 255))
                        .multilineTextAlignment(.center)
                }

                Button(action: onLogin) {
                    Text("登录")
                        .font(.body.weight(.semibold))
                        .frame(maxWidth: .infinity, minHeight: 48)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 4)
                        .foregroundStyle(.white)
                        .background(blue, in: Capsule())
                }
                .buttonStyle(.plain)
            }
            .frame(maxWidth: 360)
            .padding(.horizontal, 24)
            .padding(.vertical, 32)
            .containerRelativeFrame(.vertical, alignment: .center)
            .frame(maxWidth: .infinity)
        }
        .background(.white)
    }
}

struct WebSurface: UIViewRepresentable {
    let chat: ChatBridge

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        for name in ChatBridge.messageNames {
            configuration.userContentController.add(chat, name: name)
        }
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.keyboardDismissMode = .interactive
        chat.webView = webView
        webView.load(URLRequest(url: chat.demoURL))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}

@MainActor
final class ChatBridge: NSObject, ObservableObject, WKScriptMessageHandler {
    static let messageNames = ["sokerAcquisitionReady", "sokerAcquisitionInput", "sokerChatMode", "sokerAccountMenu"]

    @Published var draft = ""
    @Published private(set) var sending = false
    @Published var ready = false
    @Published var reviewing = false
    @Published var menuOpen = false
    @Published var showServiceMessage = false
    weak var webView: WKWebView?
    private var drafts: [Bool: String] = [:]

    let demoURL: URL = {
        let arguments = ProcessInfo.processInfo.arguments
        if let index = arguments.firstIndex(of: "--demo-url"),
           arguments.indices.contains(index + 1),
           let url = URL(string: arguments[index + 1]),
           url.scheme == "https" || (url.scheme == "http" && url.host == "127.0.0.1") {
            return url
        }
        return URL(string: "http://127.0.0.1:3131/chat-tab?mode=review&embedded=1&onboarding=1")!
    }()

    func send() {
        let submittedDraft = draft
        let submittedInReview = reviewing
        let message = submittedDraft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !sending, !message.isEmpty, let webView else { return }
        sending = true
        Task {
            defer { sending = false }
            let accepted = try? await webView.callAsyncJavaScript(
                "return window.dispatchEvent(new CustomEvent('soker-acquisition-submit', { detail: message, cancelable: true }));",
                arguments: ["message": message],
                in: nil,
                contentWorld: .page
            )
            guard accepted as? Bool == true else { return }
            if reviewing == submittedInReview {
                if draft == submittedDraft { draft = "" }
            } else if drafts[submittedInReview] == submittedDraft {
                drafts[submittedInReview] = ""
            }
        }
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, message.frameInfo.request.url == demoURL else { return }
        switch message.name {
        case "sokerAcquisitionReady":
            ready = true
        case "sokerAcquisitionInput":
            if let input = message.body as? String { draft = input }
        case "sokerChatMode":
            let nextMode = message.body as? String == "review"
            if nextMode != reviewing {
                drafts[reviewing] = draft
                reviewing = nextMode
                draft = drafts[nextMode] ?? ""
            }
        case "sokerAccountMenu":
            switch message.body as? String {
            case "open": menuOpen = true
            case "close": menuOpen = false
            case "notificationSettings":
                if let url = URL(string: UIApplication.openNotificationSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            default: showServiceMessage = true
            }
        default:
            break
        }
    }
}
