const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require("crypto");
const axios = require("axios");
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const path = require('path');

// const rawConfig = fs.readFileSync('config.json');
// const config = JSON.parse(rawConfig);


const db = mysql.createConnection({
    host: mysql.host,
    user: mysql.user,
    password: mysql.password,
    database: mysql.database,
});

const connection = mysql.createConnection({
    host: mysql.host,
    user: mysql.user,
    password: mysql.password,
    database: mysql.database,
});

// MySQL 데이터베이스 연결 설정
// const db = mysql.createConnection({
//     host: config.mysql.host,
//     user: config.mysql.user,
//     password: config.mysql.password,
//     database: config.mysql.database,
// });

// const connection = mysql.createConnection({
//     host: config.mysql.host,
//     user: config.mysql.user,
//     password: config.mysql.password,
//     database: config.mysql.database,
// });

// 데이터베이스 연결
// db.connect((err) => {
//     if (err) throw err;
//     console.log('MySQL 데이터베이스에 연결되었습니다.');
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.get('/', (req, res) => res.sendFile(__dirname + '/html/index_new.html'));
app.get('/notice', (req, res) => res.sendFile(__dirname + '/html/obituary_notice_new.html'));
app.get('/sell', (req, res) => res.sendFile(__dirname + '/html/sell_new.html'));
app.get('/manage', (req, res) => res.sendFile(__dirname + '/html/manage-products_new.html'));
app.use(express.json());

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('connected to server');
});

function broadcastChange(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// 사용자 데이터 저장
app.post('/saveUserData', (req, res) => {
    let sql = 'INSERT INTO users (name, phone, account, room, relationship) VALUES (?, ?, ?, ?, ?)';
    let newUser = {
        name: req.body.name,
        phone: req.body.phone,
        account: req.body.account,
        room: req.body.room,
        relationship: req.body.relationship
    };
    db.query(sql, [newUser.name, newUser.phone, newUser.account, newUser.room, newUser.relationship], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: '사용자 정보 저장 실패' }); // JSON 응답으로 변경
            return;
        }
        res.json({ message: '사용자 정보가 데이터베이스에 저장되었습니다.' }); // JSON 응답으로 변경
    });
});

// 사용자 데이터 검색
app.get('/getUserData', (req, res) => {
    const room = req.query.room;

    // room 번호에 해당하는 사용자 데이터를 불러오는 SQL 쿼리
    const sql = 'SELECT * FROM users WHERE room = ?';

    db.query(sql, [room], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: '데이터 불러오기 실패' });
            return;
        }

        // 조회된 사용자 데이터를 JSON 형식으로 클라이언트에 반환
        res.json({ status: 'success', data: results });
    });
});

// 사용자 데이터 삭제 라우트
app.post('/delete-user', (req, res) => {
    const userId = req.body.id; // 클라이언트에서 전송한 사용자 ID

    // 데이터베이스에서 해당 사용자 ID를 가진 레코드 삭제
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('사용자 데이터 삭제 실패');
            return;
        }

        // 삭제 성공 응답
        res.send('사용자 데이터가 삭제되었습니다.');
    });
});

// const coolsms = require("coolsms-node-sdk").default;
// const messageService = new coolsms(config.coolsms.apikey, config.coolsms.apikey2);

const coolsms = require("coolsms-node-sdk").default;
const messageService = new coolsms(coolsms.apikey, coolsms.apikey2);
// 단일 발송 예제
app.post('/send-sms', (req, res) => {
    const { to, text } = req.body; // 요청 본문에서 전화번호와 문자 내용을 받음

    messageService.sendOne({
        to: to,
        from: "01050422652", // 여기에 발신자 번호를 입력
        text: text
    }).then(response => {
        console.log(response);
        res.send({ status: 'success', message: '문자가 발송되었습니다.' });
    }).catch(err => {
        console.error(err);
        res.send({ status: 'error', message: '문자 발송 실패' });
    });
});

// Endpoint to receive and save the content
app.post('/saveObituary', (req, res) => {
    const { userId, admission, funeralDate, burialDate, bankAccount } = req.body;

    // Check if userId is provided
    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    // SQL query to insert the obituary content with userId
    const query = 'INSERT INTO obituarynotice (userId, admission, funeralDate, burialDate, bankAccount) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [userId, admission, funeralDate, burialDate, bankAccount], (error, results) => {
        if (error) {
            console.error(error);  // Log the error for debugging
            return res.status(500).send('Error saving to database');
        }
        res.send('Content successfully saved');
    });
});


//부고장
app.post('/submit-obituary-notice', upload.none(), (req, res) => {
    // 애도 메시지를 요청 본문에서 가져옵니다.
    const obituarynoticeMessage = req.body.obituarynoticeMessage;

    // 애도 메시지가 비어있는지 확인
    if (!obituarynoticeMessage) {
        res.status(400).send('애도 메시지가 필요합니다.');
        //console.log(obituarynoticeMessage);
        return;
    }

    // 데이터베이스에 저장할 쿼리를 작성합니다.
    let sql = 'INSERT INTO obituarynotice SET ?';
    let newobituarynotice = {
        contents: obituarynoticeMessage,
    };

    // 쿼리 실행
    db.query(sql, newobituarynotice, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('메시지 저장 실패');
            return;
        }
        res.send('메시지가 저장되었습니다.');
    });
});

app.get('/getobituarynotice', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        res.status(400).send('User ID is required');
        return;
    }

    const query = 'SELECT admission, funeralDate, burialDate, bankAccount FROM obituarynotice WHERE userId = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching obituary information');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('User not found');
            return;
        }

        const obituaryInfo = results[0];
        res.json({
            obituary: {
                admission: obituaryInfo.admission,
                funeralDate: obituaryInfo.funeralDate,
                burialDate: obituaryInfo.burialDate,
                bankAccount: obituaryInfo.bankAccount
            }
        });
    });
});

//부고장 정보 받아오기
app.get('/get-obituary-data', (req, res) => {
    // 예시로 'id' 매개변수를 사용하여 특정 부고장 데이터를 조회합니다.
    // 실제 구현에 따라 적절한 식별자나 조건을 사용해야 합니다.
    const obituaryId = req.query.id;

    const sql = 'SELECT * FROM obituarynotice WHERE id = ?';
    db.query(sql, [obituaryId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('부고장 데이터 조회 실패');
            return;
        }

        if (results.length > 0) {
            // 부고장 데이터가 존재하는 경우
            const obituaryData = results[0];
            res.json({
                name: obituaryData.name, // 부고자 이름
                date: obituaryData.date, // 작성 날짜
                // 기타 필요한 데이터
            });
        } else {
            // 해당 ID의 부고장 데이터가 없는 경우
            res.status(404).send('부고장 데이터가 존재하지 않습니다.');
        }
    });
});

//부고 정보 조회 엔드포인트
app.get('/getObituaryInfo', (req, res) => {
    const userId = req.query.userId;
    // userId를 사용하여 부고 정보를 조회하는 SQL 쿼리
    const sql = 'SELECT * FROM obituaryinfo WHERE userId = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: '정보 조회 실패' });
            return;
        }
        if (results.length > 0) {
            res.json({ status: 'success', obituary: results[0] });
        } else {
            res.json({ status: 'not found', obituary: null });
        }
    });
});

//부고 정보 업데이트
app.post('/updateObituaryInfo', (req, res) => {
    const { userId, name, date } = req.body;
    // 부고 정보를 업데이트하는 SQL 쿼리
    const sql = 'UPDATE obituaryinfo SET name = ?, date = ? WHERE userId = ?';
    db.query(sql, [name, date, userId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: '정보 업데이트 실패' });
            return;
        }
        res.json({ status: 'success', message: '부고 정보가 업데이트되었습니다.' });
    });
});

// 부고 정보 저장 라우트
app.post('/submit-obituary-info', (req, res) => {
    const { name, date, userId } = req.body;  // 클라이언트에서 전송한 이름과 날짜

    // 데이터베이스에 저장할 쿼리를 작성합니다.
    const sql = 'INSERT INTO obituaryinfo (name, date, userId) VALUES (?, ?, ?)';
    db.query(sql, [name, date, userId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('부고 정보 저장 실패');
            return;
        }

        // 저장 성공 응답
        res.send('정보가 저장되었습니다.');
    });
});

// Route to handle adding a new product
app.post('/add-product', function (req, res) {
    const newProduct = req.body;

    const query = 'INSERT INTO products (name, price, image) VALUES (?, ?, ?)';
    connection.query(query, [newProduct.name, newProduct.price, newProduct.image], function (error, results, fields) {
        if (error) {
            res.status(500).send('Error adding product');
            return;
        }

        broadcastChange(JSON.stringify({ action: 'add', product: newProduct }));
        res.status(200).send('Product added successfully');
    });
});

// 상품 목록 조회
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products'; // 'products'는 상품 데이터를 저장하는 테이블 이름입니다.
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ message: '상품 조회 중 오류 발생' });
            return;
        }
        res.json(results);
    });
});

// 상품 삭제
app.delete('/api/products/:id', function (req, res) {
    const productId = req.params.id;

    const query = 'DELETE FROM products WHERE id = ?';
    connection.query(query, [productId], function (error, results, fields) {
        if (error) {
            res.status(500).send('Error deleting product');
            return;
        }

        broadcastChange(JSON.stringify({ action: 'delete', productId: productId }));
        res.status(200).send('Product deleted successfully');
    });
});

//조환주문
app.post('/order', (req, res) => {
    const { product, name, phoneNumber, address } = req.body;
    const query = 'INSERT INTO orders (product, name, phoneNumber, Address) VALUES (?, ?, ?, ?)';

    connection.query(query, [product, name, phoneNumber, address], (error, results, fields) => {
        if (error) throw error;
        res.json({ message: 'Order placed successfully', orderId: results.insertId });
    });
});

// 주문 목록 조회
app.get('/order', (req, res) => {
    const query = 'SELECT * FROM orders'; // 'products'는 상품 데이터를 저장하는 테이블 이름입니다.
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ message: '상품 조회 중 오류 발생' });
            return;
        }
        res.json(results);
    });
});

// 주문 내역 상세 조회 엔드포인트
app.get('/order/:id', (req, res) => {
    const orderId = req.params.id;
    connection.query('SELECT * FROM orders WHERE Id = ?', [orderId], (error, results) => {
        if (error) {
            res.status(500).send({ error: 'Something failed!' });
        } else {
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).send({ message: 'Order not found' });
            }
        }
    });
});

//주문 내역 삭제
app.delete('/order/:id', function (req, res) {
    const orderId = req.params.id;

    const query = 'DELETE FROM orders WHERE id = ?';
    connection.query(query, [orderId], function (error, results, fields) {
        if (error) {
            res.status(500).send('Error deleting product');
            return;
        }

        broadcastChange(JSON.stringify({ action: 'delete', orderId: orderId }));
        res.status(200).send('Product deleted successfully');
    });
});

app.get('/end', (req, res) => {
    // final_obituary_notice.html 파일을 응답으로 전송합니다.
    res.sendFile(path.join(__dirname, 'html', 'end.html'));
});

app.listen(3030, () => {
    console.log('서버가 3030번 포트에서 실행 중입니다.');
});
