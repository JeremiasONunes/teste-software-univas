@echo off
cd /d "C:\Users\JeremiasONunes\Desktop\github\teste-software-univas"

echo Limpando resultados anteriores...
if exist "backend\tests\jmeter\results\load-tasks.jtl" del "backend\tests\jmeter\results\load-tasks.jtl"
if exist "backend\tests\jmeter\reports\load-tasks" rmdir /s /q "backend\tests\jmeter\reports\load-tasks"

echo Executando teste de carga - 200 usuarios simultaneos...
echo Ramp-up: 30 segundos
echo Endpoint: /api/tasks
echo.

C:\Tools\apache-jmeter-5.6.3\bin\jmeter.bat -n -t "backend\tests\jmeter\plans\load-tasks.jmx" -l "backend\tests\jmeter\results\load-tasks.jtl" -e -o "backend\tests\jmeter\reports\load-tasks" -q "backend\tests\jmeter\props\load-test.properties"

echo.
echo Teste concluido!
echo Resultados: backend\tests\jmeter\results\load-tasks.jtl
echo Relatorio: backend\tests\jmeter\reports\load-tasks\index.html
echo.
pause