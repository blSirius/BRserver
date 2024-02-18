const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const secretKey = 'PeemSecret';

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect(err => {
    if (err) throw err;
    console.log('MySQL connected');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const query = 'INSERT INTO authentication (username, password) VALUES (?, ?)';
        const values = [username, password];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error('Error during registration:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.status(201).json(results);
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const query = 'SELECT * FROM authentication WHERE username = ? AND password = ?';
        const values = [username, password];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error('Error during login:', error);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            const token = jwt.sign({ username: username }, secretKey, { expiresIn: '1h' });

            res.json({ message: 'Login successful', token: token });
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/decodeToken', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token not provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        res.json({ message: 'decoded success', decoded: decoded });
    });
});

app.post('/post_book', (req, res) => {
    const { id, name, category, amount, file } = req.body;
    try {
        const query = 'INSERT INTO book (id, book_name, category, amount, borrowing, file) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [id, name, category, amount, 0, file];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.status(201).json(results);
        });
    } catch (error) {
        console.error('Error during add book:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/post_member', (req, res) => {
    const { id, name, surname, address, phone_number } = req.body;
    try {
        const query = 'INSERT INTO member (id, name, surname, address, phone_number) VALUES (?, ?, ?, ?, ?)';
        const values = [id, name, surname, address, phone_number];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.status(201).json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/post_borrow', (req, res) => {
    const { memberID, book_id, currentDate, lastestDate } = req.body;
    try {
        const query = 'INSERT INTO borrow (member_id , book_id, currentdate,  lastestdate) VALUES (?, ?, ?, ?)';
        const values = [memberID, book_id, currentDate, lastestDate];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.status(201).json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get_category', (req, res) => {
    try {
        const query = 'SELECT * FROM category';

        connection.query(query, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get_book', (req, res) => {
    try {
        const query = 'SELECT * FROM book ORDER BY book_name';

        connection.query(query, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get_member', (req, res) => {
    try {
        const query = 'SELECT * FROM member ORDER BY id';

        connection.query(query, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get_borrowlist', (req, res) => {
    try {
        const query = 'SELECT borrow.id, borrow.book_id, member.name, member.surname, book.book_name, borrow.currentdate, borrow.lastestdate FROM borrow INNER JOIN member ON borrow.member_id = member.id INNER JOIN book ON borrow.book_id = book.id';

        connection.query(query, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/get_book_by_id', (req, res) => {
    const { id } = req.query; // Use req.query to get query parameters

    try {
        const query = 'SELECT * FROM book WHERE id = ?';
        const values = [id];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (results.length === 0) {
                console.log('Book not found');
                return res.status(404).json({ message: 'Book not found' });
            }

            res.json(results[0]);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get_member_by_id', (req, res) => {
    const { id } = req.query;

    try {
        const query = 'SELECT * FROM member WHERE id = ?';
        const values = [id];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (results.length === 0) {
                console.log('Member not found');
                return res.status(404).json({ message: 'Book not found' });
            }

            res.json(results[0]);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/update_book/:id', (req, res) => {
    const { id } = req.params;
    const { name, category, amount, file } = req.body;

    const query = 'UPDATE book SET book_name = ?, category = ?, amount = ?, file = ? WHERE id = ?';

    const values = [name, category, amount, file, id];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error during book update:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.affectedRows === 0) {
            res.status(404).send('Book not found or no change in data.');
        } else {
            res.status(200).json({ message: 'Book updated successfully' });
        }
    });
});

app.put('/update_book_borrowing/:id', (req, res) => {
    const { id } = req.params;

    const query = 'UPDATE book SET borrowing = borrowing + 1 WHERE id = ?';

    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error(error);
            res.json(false);
            return;
        }

        console.log('Book borrowed successfully');
        res.json(true);
    });
});

app.put('/update_book_return/:id', (req, res) => {
    const { id } = req.params;

    const query = 'UPDATE book SET borrowing = borrowing - 1 WHERE id = ?';

    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error(error);
            res.json(false);
            return;
        }

        console.log('Book borrowed successfully');
        res.json(true);
    });
});

app.get('/check_book_amount/:id', (req, res) => {

    const { id } = req.params; // Use req.query to get query parameters
    console.log('book id : ' + id);

    try {
        const query = 'SELECT * FROM book WHERE id = ?';
        const values = [id];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.send('Internal Server Error');
                return;
            }
            if (results[0].amount > results[0].borrowing) {
                res.json(true)
            }
            else {
                res.json(false)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

});

app.put('/update_member/:id', (req, res) => {
    const { id } = req.params;
    const { name, surname, address, phone_number } = req.body;

    const query = 'UPDATE member SET name = ?, surname = ?, address = ?, phone_number = ? WHERE id = ?';

    const values = [name, surname, address, phone_number, id];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error during member update:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.affectedRows === 0) {
            res.status(404).send('Member not found or no change in data.');
        } else {
            res.status(200).json({ message: 'Member updated successfully' });
        }
    });
});

app.delete('/delete_member/:id', (req, res) => {
    const memberId = req.params.id;

    try {
        const query = 'DELETE FROM member WHERE id = ?';
        const values = [memberId];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (results.affectedRows === 0) {
                console.log('Member not found');
                return res.status(404).json({ message: 'Member not found' });
            }

            res.status(200).json({ message: 'Member deleted successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/delete_book/:id', (req, res) => {
    const bookId = req.params.id;

    try {
        const query = 'DELETE FROM book WHERE id = ?';
        const values = [bookId];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (results.affectedRows === 0) {
                console.log('Member not found');
                return res.status(404).json({ message: 'Book not found' });
            }

            res.status(200).json({ message: 'Book deleted successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/delete_borrowlist/:id', (req, res) => {
    const borrow_id = req.params.id;

    try {
        const query = 'DELETE FROM borrow WHERE id = ?';
        const values = [borrow_id];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.send('Internal Server Error');
                return;
            }

            res.json('delete success fully');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/', (req, res) => {
    res.json('server is running')
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});