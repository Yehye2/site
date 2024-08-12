require('dotenv').config();
const AWS = require('aws-sdk');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const express = require('express');
const app = express();
const http = require('http');
const multer = require('multer');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require("crypto");
const axios = require("axios");
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const fs = require('fs');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// const s3 = new aws.S3();
const path = require('path');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'testtest9515',
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + path.extname(file.originalname));
        }
    })
});

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// 데이터베이스 연결
db.connect((err) => {
    if (err) throw err;
    console.log('MySQL 데이터베이스에 연결되었습니다.');
});

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'image')));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.get('/', (req, res) => res.sendFile(__dirname + '/html/index_new.html'));
app.get('/end', (req, res) => {
    let html = fs.readFileSync(path.join(__dirname, '/html/end.html'), 'utf8');
    html = html.replace('%MAP_API_KEY%', process.env.MAP_API_KEY);
    res.send(html);
});
app.get('/config', (req, res) => {
    res.json({ KAKAO_API_KEY: process.env.KAKAO_API_KEY });
});

app.get('/notice', (req, res) => {
    let html = fs.readFileSync(path.join(__dirname, '/html/obituary_notice_new.html'), 'utf8');
    html = html.replace('%MAP_API_KEY%', process.env.MAP_API_KEY);
    res.send(html);
});
app.get('/sell', (req, res) => res.sendFile(__dirname + '/html/sell_new.html'));
app.get('/manage', (req, res) => res.sendFile(__dirname + '/html/manage-products_new.html'));
app.get('/new', (req, res) => res.sendFile(__dirname + '/html/new.html'));
app.get('/test2', (req, res) => res.sendFile(__dirname + '/html/test2.html'));
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

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // AWS 비밀 접근 키
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // AWS 접근 키 ID
    region: 'us-west-2' // 예: 'us-west-2'
});

const multerUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'yehye',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
});


app.get('/config', (req, res) => {
    res.json({ KAKAO_APP_KEY: process.env.KAKAO_APP_KEY });
});

app.post('/upload', multerUpload.single('image'), (req, res) => {
    res.send('이미지가 성공적으로 업로드 되었습니다.');
});

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

const coolsms = require("coolsms-node-sdk").default;
const messageService = new coolsms(process.env.apikey, process.env.apikey2);

// 단일 발송 예제
app.post('/send-sms', (req, res) => {
    const { to, text } = req.body; // 요청 본문에서 전화번호와 문자 내용을 받음

    messageService.sendOne({
        to: to,
        from: "01082164533", // 여기에 발신자 번호를 입력
        text: text
    }).then(response => {
        console.log(response);
        res.send({ status: 'success', message: '문자가 발송되었습니다.' });
    }).catch(err => {
        console.error(err);
        res.send({ status: 'error', message: '문자 발송 실패' });
    });
});

// 카카오톡 단일 발송
app.post('/send-kakao', (req, res) => {
    const { to, text, name, room, mournersString, userId } = req.body;

    messageService.sendOne({
        to: to,
        from: "01082164533",
        kakaoOptions: {
            pfId: "KA01PF240503095327165cDlOB6viY5w",
            templateId: "KA01TP240810103458100ThdGnnbt0yt",
            variables: {
                "#{name}": name,
                "#{link}": room,
                "#{room}": text,
                "#{userId}": userId,
                "#{mourners}": mournersString
            }
        }
    }).then(response => {
        console.log(response);
        res.send({ status: 'success', message: '알림톡이 발송되었습니다.' });
    }).catch(err => {
        console.error(err);
        res.send({ status: 'error', message: '알림톡 발송 실패' });
    });
});

app.post('/saveObituary', (req, res) => {
    const { random, admission, funeralDate, burialDate, bankAccount, room } = req.body;

    // Check if userId is provided
    // SQL query to insert the obituary content with userId
    const query = 'INSERT INTO obituarynotice (random, admission, funeralDate, burialDate, bankAccount) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [random, admission, funeralDate, burialDate, bankAccount, room], (error, results) => {
        if (error) {
            console.error(error);  // Log the error for debugging
            return res.status(500).send('Error saving to database');
        }
        res.send('Content successfully saved');
    });
});


//호실번호로 정보저장
app.post('/saveRoomObituary', (req, res) => {
    const { State, admission, funeralDate, burialDate, bankAccount, room } = req.body;

    const query = 'INSERT INTO obituarynotice (State, admission, funeralDate, burialDate, bankAccount, room) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(query, [State, admission, funeralDate, burialDate, bankAccount, room], (error, results) => {
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

//유저아이디로 부고장 정보 받아오기
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

app.get('/getobituarynoticeByRoom', (req, res) => {
    const room = req.query.room; // 변경된 파라미터 이름
    if (!room) {
        res.status(400).send('Room number is required'); // 에러 메시지 변경
        return;
    }

    const query = 'SELECT State, admission, funeralDate, burialDate, bankAccount FROM obituarynotice WHERE room = ?';

    db.query(query, [room], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching obituary information');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Room not found'); // 에러 메시지 변경
            return;
        }

        const obituaryInfo = results[0];
        res.json({
            obituary: {
                State: obituaryInfo.State,
                admission: obituaryInfo.admission,
                funeralDate: obituaryInfo.funeralDate,
                burialDate: obituaryInfo.burialDate,
                bankAccount: obituaryInfo.bankAccount,
                room: obituaryInfo.room
            }
        });
    });
});

app.get('/getobituarynoticeByRandom', (req, res) => {
    const random = req.query.random; // 변경된 파라미터 이름
    if (!random) {
        res.status(400).send('Room number is required'); // 에러 메시지 변경
        return;
    }

    const query = 'SELECT bankAccount FROM obituarynotice WHERE random = ?';

    db.query(query, [random], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching obituary information');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Room not found'); // 에러 메시지 변경
            return;
        }

        const obituaryInfo = results[0];
        res.json({
            obituary: {
                bankAccount: obituaryInfo.bankAccount
            }
        });
    });
});

app.delete('/deleteRoom', function (req, res) {
    const room = req.body.room;

    // 트랜잭션 시작
    connection.beginTransaction(function (err) {
        if (err) { // 트랜잭션 시작 실패
            res.status(500).send('Transaction Start Error');
            return;
        }

        // obituaryinfo 테이블에서 삭제
        const queryObituaryInfo = 'DELETE FROM obituaryinfo WHERE room = ?';
        connection.query(queryObituaryInfo, [room], function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    res.status(500).send('Error deleting from obituaryinfo');
                });
            }

            // cheif_mourner 테이블에서 삭제
            const queryChiefMourner = 'DELETE FROM cheif_mourner WHERE room = ?';
            connection.query(queryChiefMourner, [room], function (error, results, fields) {
                if (error) {
                    return connection.rollback(function () {
                        res.status(500).send('Error deleting from cheif_mourner');
                    });
                }

                // obituarynotice 테이블에서 삭제
                const queryObituaryNotice = 'DELETE FROM obituarynotice WHERE room = ?';
                connection.query(queryObituaryNotice, [room], function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function () {
                            res.status(500).send('Error deleting from obituarynotice');
                        });
                    }

                    // 모든 삭제 작업이 성공적으로 완료되었다면, 변경사항을 확정(commit)
                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                res.status(500).send('Commit failed');
                            });
                        }
                        res.status(200).send('Room and related information deleted successfully');
                    });
                });
            });
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

app.get('/getObituaryInfoByRoom', (req, res) => {
    const room = req.query.room;
    const sql = 'SELECT * FROM obituaryinfo WHERE room = ?';
    db.query(sql, [room], (err, results) => {
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

// app.post('/submitroomobituaryinfo', (req, res) => {
//     const { name, date, room } = req.body;  // 클라이언트에서 전송한 이름과 날짜

//     // 데이터베이스에 저장할 쿼리를 작성합니다.
//     const sql = 'INSERT INTO obituaryinfo (name, date,room) VALUES (?, ?, ?)';
//     db.query(sql, [name, date, room], (err, result) => {
//         if (err) {
//             console.error(err);
//             res.status(500).send('부고 정보 저장 실패');
//             return;
//         }

//         // 저장 성공 응답
//         res.send('정보가 저장되었습니다.');
//     });
// });

// 이미지 업로드 엔드포인트
app.post('/submitroomobituaryinfo', upload.single('obituaryImage'), (req, res) => {
    let imageUrl = '';

    if (req.file) {
        imageUrl = req.file.location;  // S3에 업로드된 이미지 URL
    }

    const { name, date, room } = req.body;

    const sql = 'INSERT INTO obituaryinfo (name, date, room, image) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, date, room, imageUrl], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('부고 정보 저장 실패');
        }
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

// 상주 정보 저장을 위한 POST 요청 처리
app.post('/addMourner', async (req, res) => {
    const { primaryMournerRelation, primaryMournerName, room } = req.body;

    if (!primaryMournerRelation || !primaryMournerName || !room) {
        return res.status(400).send('Missing required fields');
    }

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        await connection.beginTransaction();

        for (let i = 0; i < primaryMournerRelation.length; i++) {
            const relation = primaryMournerRelation[i];
            const name = primaryMournerName[i];

            const query = 'INSERT INTO cheif_mourner (relation, name, room) VALUES (?, ?, ?)';
            await connection.query(query, [relation, name, room]);
        }

        await connection.commit();
        res.status(200).send('Mourners added successfully');
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error adding mourners:', error);
        res.status(500).send('Error adding mourners');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

app.get('/cheif_mourner', (req, res) => {
    const room = req.query.room;
    const sql = 'SELECT * FROM cheif_mourner WHERE room = ?';
    db.query(sql, [room], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: '정보 조회 실패' });
            return;
        }
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json({ status: 'not found', obituary: null });
        }
    });
});

// '/updateObituaryInfo' 엔드포인트에 대한 PATCH 요청 핸들러
app.patch('/updateObituaryInfo', upload.single('obituaryImage'), (req, res) => {
    const { name, date, room } = req.body;
    let imageUrl = null;

    if (req.file) {
        imageUrl = req.file.location;  // S3에 업로드된 이미지 URL
    }

    let sql = "UPDATE obituaryinfo SET date = ?, name = ?";
    let params = [date, name];

    if (imageUrl) {
        sql += ", image = ?";
        params.push(imageUrl);
    }

    sql += " WHERE room = ?";
    params.push(room);

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('MySQL 에러:', err);
            res.status(500).send('정보 수정 중 오류가 발생했습니다.');
        } else {
            res.send('Obituary 정보가 성공적으로 업데이트되었습니다.');
        }
    });
});

// '/updateRoomObituary' 엔드포인트에 대한 PATCH 요청 핸들러
app.patch('/updateRoomObituary', (req, res) => {
    const { admission, funeralDate, burialDate, bankAccount, room } = req.body;
    const sql = "UPDATE obituarynotice SET funeralDate = ?, burialDate = ?, bankAccount = ?, admission = ? WHERE room = ?";
    db.query(sql, [funeralDate, burialDate, bankAccount, admission, room], (err, result) => {
        if (err) {
            console.error('MySQL 에러:', err);
            res.status(500).send('방 정보 수정 중 오류가 발생했습니다.');
        } else {
            res.send('Room Obituary 정보가 성공적으로 업데이트되었습니다.');
        }
    });
});

// '/updateMourners' 엔드포인트에 대한 PATCH 요청 핸들러
app.patch('/updateMourners', (req, res) => {
    const { primaryMournerRelation, primaryMournerName, room } = req.body;

    // primaryMournerRelation과 primaryMournerName의 길이가 같은지 확인
    if (primaryMournerRelation.length !== primaryMournerName.length) {
        return res.status(400).send('관계와 이름의 수가 일치하지 않습니다.');
    }

    // primaryMournerRelation과 primaryMournerName의 길이만큼 반복하여 쿼리 실행
    let completedQueries = 0;
    for (let i = 0; i < primaryMournerRelation.length; i++) {
        const relation = primaryMournerRelation[i];
        const name = primaryMournerName[i];

        // 데이터베이스에 삽입
        const sql = "UPDATE cheif_mourner SET relation = ?, name = ? WHERE room = ?";
        db.query(sql, [relation, name, room], (err, result) => {
            if (err) {
                console.error('MySQL 에러:', err);
                return res.status(500).send('유가족 정보를 업데이트하는 중 오류가 발생했습니다.');
            }
            completedQueries++;

            // 모든 쿼리가 완료되었을 때 응답을 보냄
            if (completedQueries === primaryMournerRelation.length) {
                res.send('Mourners 정보가 성공적으로 업데이트되었습니다.');
            }
        });
    }
});

app.delete('/deleteMourner', (req, res) => {
    const room = req.body.room; // 클라이언트에서 전송한 사용자 ID

    // 데이터베이스에서 해당 사용자 ID를 가진 레코드 삭제
    const sql = 'DELETE FROM cheif_mourner WHERE room = ?';
    db.query(sql, [room], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('상주 데이터 삭제 실패');
            return;
        }

        // 삭제 성공 응답
        res.send('상주 데이터가 삭제되었습니다.');
    });
});

app.delete('/deleteAllUser', (req, res) => {
    const room = req.body.room; // 클라이언트에서 전송한 사용자 ID

    // 데이터베이스에서 해당 사용자 ID를 가진 레코드 삭제
    const sql = 'DELETE FROM users WHERE room = ?';
    db.query(sql, [room], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('유저 데이터 삭제 실패');
            return;
        }

        // 삭제 성공 응답
        res.send('유저 데이터가 삭제되었습니다.');
    });
});

app.listen(3030, () => {
    console.log('서버가 3030번 포트에서 실행 중입니다.');
});
