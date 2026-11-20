/** iOS 主屏幕模式没有浏览器返回栏，这里提供应用内返回。 */
export function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.hash = '/';
  }
}
