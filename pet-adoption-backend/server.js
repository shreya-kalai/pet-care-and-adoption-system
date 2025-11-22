const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Kpss@love123',
  database: process.env.DB_NAME || 'PetAdoptionSystems'
});

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL Database');
  }
});

// ✅ Test route
app.get('/', (req, res) => {
  res.send('Pet Adoption System Backend is Running 🐾');
});

// ✅ Basic lists to help the frontend choose valid IDs
app.get('/users', (req, res) => {
  db.query('SELECT UserID, Name FROM User ORDER BY Name ASC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch users', details: err });
    res.json(results);
  });
});

app.get('/staff', (req, res) => {
  db.query('SELECT StaffID, Name, Role FROM Staff ORDER BY Name ASC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch staff', details: err });
    res.json(results);
  });
});

// ✅ Get all pets
app.get('/pets', (req, res) => {
  db.query('SELECT * FROM Pet', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ✅ Add new pet
app.post('/pets', (req, res) => {
  const { Name, Breed, Species, Age, HealthStatus, VaccinationStatus } = req.body;
  const query = `INSERT INTO Pet (Name, Breed, Species, Age, HealthStatus, VaccinationStatus)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(query, [Name, Breed, Species, Age, HealthStatus, VaccinationStatus], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Pet added successfully!', PetID: result.insertId });
  });
});

app.post('/pets/:id/adopt', (req, res) => {
  const { id } = req.params;
  const { UserID, Notes } = req.body || {};
  const insertAdoption = (uid) => {
    const sql = `INSERT INTO Adoption (PetID, UserID, AdoptionDate, Notes) VALUES (?, ?, CURDATE(), ?)`;
    db.query(sql, [id, uid, Notes || null], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Pet already adopted' });
        }
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return db.query('UPDATE Pet SET HealthStatus = ? WHERE PetID = ?', ['Adopted', id], (e2) => {
            if (e2) return res.status(500).json({ error: 'Failed to adopt pet', details: e2 });
            return res.json({ message: 'Pet adopted successfully' });
          });
        }
        return res.status(500).json({ error: 'Failed to adopt pet', details: err });
      }
      res.json({ message: 'Pet adopted successfully', AdoptionID: result.insertId });
    });
  };

  if (UserID) return insertAdoption(UserID);

  db.query('SELECT UserID FROM User ORDER BY UserID ASC LIMIT 1', (e, rows) => {
    if (e) return res.status(500).json({ error: 'Failed to adopt pet', details: e });
    if (rows && rows.length) {
      return insertAdoption(rows[0].UserID);
    }
    db.query('UPDATE Pet SET HealthStatus = ? WHERE PetID = ?', ['Adopted', id], (e2) => {
      if (e2) return res.status(500).json({ error: 'Failed to adopt pet', details: e2 });
      return res.json({ message: 'Pet adopted successfully' });
    });
  });
});

// ✅ Vets
app.get('/vets', (req, res) => {
  db.query('SELECT * FROM Vet', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ✅ Appointments
app.get('/appointments', (req, res) => {
  const sql = `SELECT a.AppointmentID, a.PetID, p.Name AS PetName, a.VetID, v.Name AS VetName, a.AppointmentDateTime, a.Notes
               FROM Appointment a
               JOIN Pet p ON p.PetID = a.PetID
               JOIN Vet v ON v.VetID = a.VetID
               ORDER BY a.AppointmentDateTime DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post('/appointments', (req, res) => {
  const { PetID, VetID, AppointmentDateTime, Notes } = req.body;
  const sql = `INSERT INTO Appointment (PetID, VetID, AppointmentDateTime, Notes) VALUES (?, ?, ?, ?)`;
  db.query(sql, [PetID, VetID, AppointmentDateTime, Notes || null], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Appointment created', AppointmentID: result.insertId });
  });
});

// ✅ Grooming Services
app.get('/grooming/services', (req, res) => {
  db.query('SELECT * FROM GroomingService ORDER BY Price ASC', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post('/grooming/services', (req, res) => {
  const { ServiceType, Price, Notes } = req.body;
  if (!ServiceType || Price === undefined || Price === null) {
    return res.status(400).json({ error: 'Missing required fields', required: ['ServiceType','Price'] });
  }
  const sql = `INSERT INTO GroomingService (ServiceType, Price, Notes) VALUES (?, ?, ?)`;
  db.query(sql, [ServiceType, Price, Notes || null], (err, result) => {
    if (err) {
      console.error('Create service failed:', err);
      return res.status(500).json({ error: 'Failed to create service', details: err });
    }
    res.json({ message: 'Service created', ServiceID: result.insertId });
  });
});

// ✅ Grooming Bookings
app.get('/grooming/bookings', (req, res) => {
  const sql = `SELECT b.BookingID, b.Date, b.Notes, u.Name AS UserName, p.Name AS PetName, s.ServiceType, st.Name AS StaffName
               FROM Booking b
               JOIN User u ON u.UserID = b.UserID
               JOIN Pet p ON p.PetID = b.PetID
               JOIN GroomingService s ON s.ServiceID = b.ServiceID
               JOIN Staff st ON st.StaffID = b.StaffID
               ORDER BY b.Date DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post('/grooming/bookings', (req, res) => {
  const { UserID, PetID, ServiceID, StaffID, Date, Notes } = req.body;
  if (!UserID || !PetID || !ServiceID || !StaffID || !Date) {
    return res.status(400).json({ error: 'Missing required fields', required: ['UserID','PetID','ServiceID','StaffID','Date'] });
  }
  db.query('SELECT GetServicePrice(?) AS price', [ServiceID], (perr, rows) => {
    // Do not fail the booking if price lookup fails; proceed with null price and log the issue.
    if (perr) {
      console.warn('Price lookup failed, proceeding without price:', perr);
    }
    const price = perr ? null : (rows?.[0]?.price ?? null);
    const sql = `CALL BookGroomingService(?, ?, ?, ?, ?, ?)`;
    db.query(sql, [UserID, PetID, ServiceID, StaffID, Date, Notes || null], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create booking', details: err });
      }
      const insertId = Array.isArray(result) && result.length > 0 && result[0].insertId ? result[0].insertId : undefined;
      res.json({ message: 'Grooming booking created', BookingID: insertId, price });
    });
  });
});

// ✅ Medical Records
app.get('/medical-records/:petId', (req, res) => {
  const { petId } = req.params;
  const sql = `SELECT * FROM MedicalRecord WHERE PetID = ? ORDER BY RecordDate DESC`;
  db.query(sql, [petId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post('/medical-records', (req, res) => {
  const { PetID, Purpose, Notes, Treatment, Description, AppointmentDate, RecordDate } = req.body;
  const sql = `INSERT INTO MedicalRecord (PetID, Purpose, Notes, Treatment, Description, AppointmentDate, RecordDate)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [PetID, Purpose || null, Notes || null, Treatment || null, Description || null, AppointmentDate || null, RecordDate],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Medical record added', RecordID: result.insertId });
    }
  );
});

app.get('/users/:userId/adoptions/count', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT GetUserAdoptionCount(?) AS count', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to get adoption count', details: err });
    res.json({ count: rows?.[0]?.count || 0 });
  });
});

app.get('/grooming/services/:serviceId/price', (req, res) => {
  const { serviceId } = req.params;
  db.query('SELECT GetServicePrice(?) AS price', [serviceId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to get service price', details: err });
    res.json({ price: rows?.[0]?.price ?? null });
  });
});

app.post('/users/register-with-pet', (req, res) => {
  const { Name, Email, Address, Phone, UserType, PetName, Breed, Species, Age, HealthStatus, VaccinationStatus } = req.body;
  if (!Name || !Email || !UserType || !PetName) {
    return res.status(400).json({ error: 'Missing required fields', required: ['Name','Email','UserType','PetName'] });
  }
  const sql = `CALL RegisterUserWithPet(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [Name, Email, Address || null, Phone || null, UserType, PetName, Breed || null, Species || null, Age || null, HealthStatus || null, VaccinationStatus || null],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to register user with pet', details: err });
      res.json({ message: 'User and pet registered successfully' });
    }
  );
});

app.patch('/pets/:id/health', (req, res) => {
  const { id } = req.params;
  const { HealthStatus } = req.body || {};
  if (!HealthStatus) return res.status(400).json({ error: 'HealthStatus is required' });
  db.query('UPDATE Pet SET HealthStatus = ? WHERE PetID = ?', [HealthStatus, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update health', details: err });
    res.json({ message: 'Health updated', affectedRows: result.affectedRows });
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
