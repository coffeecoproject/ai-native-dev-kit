# Mini Program UI State Checklist

- [ ] Changed pages have loading, empty, success, error, forbidden, and recovery states where applicable.
- [ ] Page lifecycle behavior is reviewed for `onLoad`, `onShow`, `onHide`, and return paths when touched.
- [ ] Navigation, tab switch, back navigation, deep link, scan/share entry, or re-entry behavior is covered when touched.
- [ ] Weak network, timeout, duplicate tap, and retry behavior are covered for critical flows.
- [ ] Evidence refs identify whether evidence came from tests, developer tools, simulator, real device, screenshots, or logs.
- [ ] Non-applicable states have concrete reasons.
