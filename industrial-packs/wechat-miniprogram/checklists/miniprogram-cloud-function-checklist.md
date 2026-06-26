# Mini Program Cloud Function Checklist

- [ ] Cloud function or API boundaries are documented for changed flows.
- [ ] Unauthorized, forbidden, expired-session, timeout, validation, and server-error behavior is covered when relevant.
- [ ] Database and storage access rules are reviewed when protected records or files are touched.
- [ ] Client-side filtering is not used as the only authorization boundary.
- [ ] Environment and production configuration changes are identified.
- [ ] Logs or failure observation evidence exists for critical cloud/API failures.
- [ ] Secrets, credentials, and real tokens are not recorded in evidence.
