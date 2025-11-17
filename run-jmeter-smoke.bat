@echo off
cd /d "C:\Users\JeremiasONunes\Desktop\github\teste-software-univas"

echo Limpando resultados anteriores...
if exist "backend\tests\jmeter\results\smoke.jtl" del "backend\tests\jmeter\results\smoke.jtl"
if exist "backend\tests\jmeter\reports\smoke" rmdir /s /q "backend\tests\jmeter\reports\smoke"

echo Executando teste JMeter...
C:\Tools\apache-jmeter-5.6.3\bin\jmeter.bat -n -t "backend\tests\jmeter\plans\smoke.jmx" -l "backend\tests\jmeter\results\smoke.jtl" -e -o "backend\tests\jmeter\reports\smoke" -q "backend\tests\jmeter\props\local.properties"
pause