const {program} = require("commander");
const http = require('node:http')
const fs = require('node:fs');
const url = require('node:url');
const {XMLBuilder} = require('fast-xml-parser');

program
  .option("-i, --input <file>", "Path to input JSON file")
  .option("-h, --host <host>", "Host for the server", "127.0.0.1")
  .option("-p, --port <number>", "Port for the server", "8080");

program.parse();

const options = program.opts();

if(!options.input || options.input.trim() == ""){
    console.error("Please specify input file");
    process.exit();
}

const filePath = options.input;
const host     = options.host;
const port     = parseInt(options.port);

// --------------------------------- Створення сервера ----------------------------
const requestListener = function(req, res){
    if (req.url === "/favicon.ico") {
        res.writeHead(204); // 204 = No Content
        res.end();
        return;
    }

    const parsedUrl          = url.parse(req.url, true);
    const queryParameters    = parsedUrl.query;

    // fs.readFile(<Шлях>, <Об'єкт_з_опціями>, callback(err, data)(err - об'єкт помилки, data вміст файлу))
    // Спочатку читає файл, callback додає у стек подій і передає значення у параметри
    fs.readFile(filePath, {encoding : "utf-8", flag : "r"}, (err, data) => {
        if(err){
            console.error("Cannot find input file");
            // res.writeHead(<Код_статусу>, <Рядок_що_описує_статус>, <Об'єкт_що_описує_дані_які_будуть_надіслані>)
            // Типи content-type:
            // 1. text/plain       - текст
            // 2. application/json - json
            // 3. application/xml  - xml
            // 4. text/html        - html сторінка
            res.writeHead(500, {"Content-type" : "text/plain"});
            // res.end(<Дані, які треба надіслати>)
            res.end("Cannot find input file");
            return;
        }

        let obj = JSON.parse(data);

        // Фільтрування за ?variety=true та ?min_petal_length=X

        // Якщо undefined - false
        if(queryParameters.min_petal_length){
            obj = obj.filter((element) => {return element["petal.length"] > parseFloat(queryParameters.min_petal_length)});
        }

        const resultObj = obj.map((element) => {
            const outputObj = {
                petal_length: element["petal.length"],
                petal_width: element["petal.width"]
            }

            if(queryParameters.variety == "true"){
                outputObj.variety = element.variety;
            }

            return outputObj;
        });
        
        const builder = new XMLBuilder({arrayNodeName: "flower"});
        const xmlOutput = builder.build({irises : {flower : resultObj}});

        console.log(xmlOutput);

        res.writeHead(200, {"Content-Type" : "application/xml"});
        res.end(xmlOutput);
});
}
const server = http.createServer(requestListener);

// Створює сокет, та починає слухати мережевий трафік
// Коли зайти на локальний хост, браузер формує http-запит
// Node js приймає запит, парсить на зрозумілу структуру
// Цю структуру(об'єкт) -> передає у параметр req - містить request таблицю у вигляді об'кта
// Також створює об'єкт http.ServerResponse і записує його у змінну res

// Відповідно у res потрібно записати дані
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});