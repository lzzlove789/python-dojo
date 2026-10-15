/**
 * 防点击劫持。GitHub Pages 不能发 X-Frame-Options，meta CSP 也不支持 frame-ancestors，
 * 所以用脚本兜底：index.html 默认把页面隐藏，只有确认自己是顶层窗口才放行；
 * 被嵌进 iframe 时尝试把顶层窗口跳转到本站，跳转被拒（如 sandbox iframe）则页面保持隐藏。
 */
export function guardFrame(win: Window = window, doc: Document = document): boolean {
  if (win.top === win.self) {
    doc.getElementById("frame-guard")?.remove();
    return true;
  }
  try {
    if (win.top) win.top.location.href = win.self.location.href;
  } catch {
    // 跨域/sandbox 下禁止改顶层地址：保持隐藏即可
  }
  return false;
}
