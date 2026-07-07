# Existing Project Safe Adoption Autopilot

The Existing Project Safe Adoption Autopilot is the read-only entry for bringing
an existing project into IntentOS working discipline.

It is a user-facing aggregation layer over existing IntentOS diagnosis systems.
It does not replace those systems, change target-project authority, install
native assets, or write target-project files.

## 1.81.0 Boundary

1.81.0 supports only S0 read-only diagnosis.

It may:

- inspect project signals;
- run read-only IntentOS diagnosis;
- compare existing project rules through existing resolvers;
- summarize whether IntentOS is available for safe use;
- identify whether deeper adoption needs collaboration-file review;
- generate a report when explicitly asked with `--out`.

It must not:

- install `.intentos/`;
- create or replace `AGENTS.md`;
- change CI, hooks, release SOP, package files, code, database, API, Web,
  Docker, production configuration, secrets, DNS, payment, provider state, or
  data;
- approve implementation, commit, push, release, production, app-store review,
  or mini-program review;
- claim full adoption.

It does not claim full adoption.

## User Promise

The user should see a plain answer:

```text
可以安全使用 IntentOS 的工作方式，但当前没有改项目文件。
如果要更深接入，下一步是准备协作说明文件的修改方案。
```

The technical trace may record internal systems, but those names must not be
required for user decisions.
