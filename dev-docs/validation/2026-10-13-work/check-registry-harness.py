import pathlib,subprocess,sys,json
root=pathlib.Path(__file__).resolve().parent
p=subprocess.run([sys.executable,str(root/'services.py'),'registry','fixed'],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
print(p.stdout[-2000:])
assert p.returncode==1,f'Known preview/conflict gate failures must return 1, observed {p.returncode}'
d=json.loads((root/'evidence/registry-gates-latest.json').read_text())
assert d['requiredPassGatesGreen'],d
assert not d['previewPassed'] and not d['backendExclusivityPassed'],d
assert d['repeatUnchanged'] and d['missingItemSafelyRejected'],d
assert d['freshConsumers'] and '/registry-runs/' in d['runDirectory'],d
assert len({v['cwd'] for v in d['steps'] if v['label']=='registry-install-a'})==1
print('HARNESS_CONTRACT_PASS: required gates green; known contract failures produce nonzero verdict; clean consumers used')
