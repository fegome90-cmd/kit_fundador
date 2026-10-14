import sys, subprocess, time, pathlib, json, os
root = pathlib.Path(__file__).resolve().parent
label, cwd, *cmd = sys.argv[1:]
start = time.time()
logfile=root/'evidence'/(label+'.log');number=2
while logfile.exists():
    logfile=root/'evidence'/(label+'-'+str(number)+'.log');number+=1
try:
    with logfile.open('w') as stream:
        p = subprocess.Popen(cmd, cwd=cwd, stdout=stream, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, start_new_session=True)
        try:code=p.wait(timeout=int(os.environ.get('LAB_TIMEOUT', '180')))
        except subprocess.TimeoutExpired:
            import signal
            os.killpg(p.pid,signal.SIGKILL);p.wait();code=124;stream.write('\nCOMMAND TIMEOUT\n')
    output=logfile.read_text()
except subprocess.TimeoutExpired as e:
    output = (e.stdout or b'').decode() if isinstance(e.stdout, bytes) else (e.stdout or '')
    output += '\nCOMMAND TIMEOUT\n'
    code = 124
logfile.write_text(output)
record = {'label':label, 'cwd':cwd, 'argv':cmd, 'started_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(start)), 'seconds':round(time.time()-start,3), 'exit_code':code, 'log':logfile.name}
with (root/'evidence'/'commands.jsonl').open('a') as f: f.write(json.dumps(record)+'\n')
print(json.dumps(record)); print(output[-6000:])
sys.exit(code)
