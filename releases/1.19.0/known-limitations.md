# 1.19.0 Known Limitations

- The precision checker uses synthetic local fixtures. It is not production
  validation.
- The scoreboard is calibration evidence. It does not approve target-project
  writes, implementation, BL2 activation, release, or production.
- Real projects can still expose project shapes not covered by the current
  fixture batch.
- False-positive and false-negative rows require ongoing review; a `fixed`
  status can become `monitor` if later trials show drift.
- Remote GitHub Actions evidence is not embedded until a run URL is recorded
  after push.
