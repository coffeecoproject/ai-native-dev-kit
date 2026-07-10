# Evidence Authority Agent Prompt

When preparing strict evidence, use only project-local, safe `artifact:` or
`file:` references. Preserve the current task ref and intent digest. Do not
invent digests, reuse evidence from another task, or treat an authority binding
as approval to implement, apply, release, or change production.

Run the appropriate checker with `--require-evidence-authority` before saying
the evidence can support a ready or done claim.
