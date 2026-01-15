@echo off
setlocal

REM Windows-friendly dev launcher (backend + frontend).
REM Opens two separate windows.

set "ROOT=%~dp0"

if not exist "%ROOT%backend\run_local.sh" (
  echo Missing backend\run_local.sh
  exit /b 1
)
if not exist "%ROOT%frontend\run_local.sh" (
  echo Missing frontend\run_local.sh
  exit /b 1
)

REM Prefer Git for Windows bash.exe
set "BASH_EXE=C:\Program Files\Git\bin\bash.exe"
if not exist "%BASH_EXE%" set "BASH_EXE=C:\Program Files\Git\usr\bin\bash.exe"
if not exist "%BASH_EXE%" set "BASH_EXE=C:\Program Files (x86)\Git\bin\bash.exe"
if not exist "%BASH_EXE%" set "BASH_EXE=C:\Program Files (x86)\Git\usr\bin\bash.exe"

if not exist "%BASH_EXE%" (
  echo Could not find Git bash.exe. Install Git for Windows first.
  exit /b 1
)

echo Starting backend and frontend...

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "^ 
  Start-Process -FilePath '%BASH_EXE%' -WorkingDirectory '%ROOT%backend' -ArgumentList @('-lc', 'cd \"%ROOT%backend\"; (./run_local.sh); code=$?; echo; echo Backend exited with code: $code; exec bash -i');^ 
  Start-Process -FilePath '%BASH_EXE%' -WorkingDirectory '%ROOT%frontend' -ArgumentList @('-lc', 'cd \"%ROOT%frontend\"; (./run_local.sh); code=$?; echo; echo Frontend exited with code: $code; exec bash -i');^ 
"

echo Done.
endlocal
