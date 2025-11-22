-- Database: PetAdoptionSystems
-- Description: Primary database for the Pet Adoption application storing users, pets, adoptions,
--              medical records, appointments, grooming services, bookings, and staff.
--              Includes triggers, procedures, and functions to keep data consistent and to support
--              app features (e.g., preventing duplicate adoptions, logging health changes).
-- Create the database
CREATE DATABASE IF NOT EXISTS PetAdoptionSystems;
USE PetAdoptionSystems;

-- User Table
-- Purpose: Stores users who can be either adopters or owners.
-- Key Points:
-- - Unique email to avoid duplicates.
-- - UserType distinguishes roles in the system.
CREATE TABLE IF NOT EXISTS User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Address VARCHAR(255),
    Phone VARCHAR(20),
    UserType ENUM('Adopter', 'Owner') NOT NULL
);

-- Pet Table
-- Purpose: Catalog of all pets managed by the system.
-- Key Points:
-- - AdoptionDate and UserID are set when a pet is adopted.
-- - HealthStatus is used by triggers to log changes and to mark adoption state.
CREATE TABLE IF NOT EXISTS Pet (
    PetID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Breed VARCHAR(100),
    Species VARCHAR(100),
    Age INT,
    AdoptionDate DATE,
    HealthStatus VARCHAR(255),
    VaccinationStatus VARCHAR(255),
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE SET NULL
);

-- Vet Table
-- Purpose: Registered veterinarians available for appointments.
CREATE TABLE IF NOT EXISTS Vet (
    VetID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Contact VARCHAR(20),
    Location VARCHAR(255),
    Gender ENUM('Male', 'Female', 'Other')
);

-- Adoption Table
-- Purpose: Records of pet adoptions linking a pet to an adopting user.
-- Key Points:
-- - PetID is UNIQUE to ensure a pet can be adopted only once.
-- - A BEFORE INSERT trigger (PreventDuplicateAdoption) additionally blocks attempts
--   to adopt a pet that is already adopted and returns a clear error message.
CREATE TABLE IF NOT EXISTS Adoption (
    AdoptionID INT PRIMARY KEY AUTO_INCREMENT,
    PetID INT UNIQUE NOT NULL, -- A pet can only be adopted once
    UserID INT NOT NULL,
    AdoptionDate DATE NOT NULL,
    Notes TEXT,
    FOREIGN KEY (PetID) REFERENCES Pet(PetID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

-- MedicalRecord Table
-- Purpose: History of medical records and health updates for pets.
-- Key Points:
-- - Populated automatically by LogPetHealthChange trigger on Pet updates.
CREATE TABLE IF NOT EXISTS MedicalRecord (
    RecordID INT PRIMARY KEY AUTO_INCREMENT,
    PetID INT NOT NULL,
    Purpose VARCHAR(255),
    Notes TEXT,
    Treatment TEXT,
    Description TEXT,
    AppointmentDate DATETIME,
    RecordDate DATE NOT NULL,
    FOREIGN KEY (PetID) REFERENCES Pet(PetID) ON DELETE CASCADE
);

-- Appointment Table
-- Purpose: Schedules pet appointments with vets.
CREATE TABLE IF NOT EXISTS Appointment (
    AppointmentID INT PRIMARY KEY AUTO_INCREMENT,
    PetID INT NOT NULL,
    VetID INT NOT NULL,
    AppointmentDateTime DATETIME NOT NULL,
    Notes TEXT,
    FOREIGN KEY (PetID) REFERENCES Pet(PetID) ON DELETE CASCADE,
    FOREIGN KEY (VetID) REFERENCES Vet(VetID) ON DELETE CASCADE
);

-- Staff Table
-- Purpose: Internal staff for operations like training, caretaking, grooming, and admin.
CREATE TABLE IF NOT EXISTS Staff (
    StaffID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Contact VARCHAR(20),
    Role ENUM('Trainer', 'Caretaker', 'Groomer', 'Admin') NOT NULL
);

-- GroomingService Table
-- Purpose: Catalog of available grooming services and their prices.
CREATE TABLE IF NOT EXISTS GroomingService (
    ServiceID INT PRIMARY KEY AUTO_INCREMENT,
    ServiceType VARCHAR(255) NOT NULL, -- e.g., Bath, Haircut, Nail trim
    Price DECIMAL(10, 2) NOT NULL,
    Notes TEXT
);

-- Booking Table (for Grooming Services)
-- Purpose: Captures bookings for grooming services with assigned staff.
CREATE TABLE IF NOT EXISTS Booking (
    BookingID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    PetID INT NOT NULL,
    ServiceID INT NOT NULL,
    StaffID INT NOT NULL,
    Date DATETIME NOT NULL,
    Notes TEXT,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    FOREIGN KEY (PetID) REFERENCES Pet(PetID) ON DELETE CASCADE,
    FOREIGN KEY (ServiceID) REFERENCES GroomingService(ServiceID) ON DELETE CASCADE,
    FOREIGN KEY (StaffID) REFERENCES Staff(StaffID) ON DELETE CASCADE
);

-- StaffService Junction Table (Many-to-Many between Staff and GroomingService)
-- Purpose: Maps which staff members can perform which services.
CREATE TABLE IF NOT EXISTS StaffService (
    StaffID INT NOT NULL,
    ServiceID INT NOT NULL,
    PRIMARY KEY (StaffID, ServiceID),
    FOREIGN KEY (StaffID) REFERENCES Staff(StaffID) ON DELETE CASCADE,
    FOREIGN KEY (ServiceID) REFERENCES GroomingService(ServiceID) ON DELETE CASCADE
);

-- Trigger: PreventDuplicateAdoption
-- Purpose: Prevent inserting an adoption for a pet that is already adopted.
-- Behavior: BEFORE INSERT on Adoption. If the pet already has an adoption record or the pet's
--           HealthStatus is 'Adopted', the trigger blocks the insert with an error.
DELIMITER $$
CREATE TRIGGER PreventDuplicateAdoption
BEFORE INSERT ON Adoption
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM Adoption WHERE PetID = NEW.PetID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pet is already adopted (existing adoption record).';
    END IF;
    IF EXISTS (SELECT 1 FROM Pet WHERE PetID = NEW.PetID AND HealthStatus = 'Adopted') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pet is already adopted (pet status).';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
-- Trigger: AfterAdoptionUpdate
-- Purpose: After a successful adoption insert, stamp the Pet with adopter user, adoption date,
--          and set HealthStatus to 'Adopted' so the UI can disable the Adopt button.
CREATE TRIGGER AfterAdoptionUpdate
AFTER INSERT ON Adoption
FOR EACH ROW
BEGIN
    UPDATE Pet
    SET
        UserID = NEW.UserID,
        AdoptionDate = NEW.AdoptionDate,
        HealthStatus = 'Adopted'
    WHERE Pet.PetID = NEW.PetID;
END$$
DELIMITER ;

DELIMITER $$
-- Procedure: BookGroomingService
-- Purpose: Creates a new grooming booking linking user, pet, service, staff, and datetime.
CREATE PROCEDURE BookGroomingService(
    IN p_UserID INT,
    IN p_PetID INT,
    IN p_ServiceID INT,
    IN p_StaffID INT,
    IN p_DateTime DATETIME,
    IN p_Notes TEXT
)
BEGIN
    INSERT INTO Booking (UserID, PetID, ServiceID, StaffID, Date, Notes)
    VALUES (p_UserID, p_PetID, p_ServiceID, p_StaffID, p_DateTime, p_Notes);
END$$
DELIMITER ;

DELIMITER $$
-- Function: GetUserAdoptionCount(p_UserID INT) RETURNS INT
-- Purpose: Returns how many pets the specified user has adopted.
-- Usage: SELECT GetUserAdoptionCount(123);
CREATE FUNCTION GetUserAdoptionCount(p_UserID INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE adoption_count INT;
    SELECT COUNT(*) INTO adoption_count
    FROM Adoption
    WHERE UserID = p_UserID;
    RETURN adoption_count;
END$$
DELIMITER ;

-- Function: GetAdoptedPetsCount() RETURNS INT
-- Purpose: Returns the total number of adopted pets across the system.
-- Usage: SELECT GetAdoptedPetsCount();
DELIMITER $$
CREATE FUNCTION GetAdoptedPetsCount()
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE c INT;
    SELECT COUNT(*) INTO c FROM Adoption;
    RETURN c;
END$$
DELIMITER ;

DELIMITER $$
-- Trigger: LogPetHealthChange
-- Purpose: When a pet's HealthStatus changes, insert an audit record into MedicalRecord.
CREATE TRIGGER LogPetHealthChange
AFTER UPDATE ON Pet
FOR EACH ROW
BEGIN
    IF NEW.HealthStatus <> OLD.HealthStatus THEN
        INSERT INTO MedicalRecord (PetID, Purpose, Description, RecordDate)
        VALUES (NEW.PetID, 'Health Update', CONCAT('HealthStatus changed from ', IFNULL(OLD.HealthStatus,'NULL'), ' to ', IFNULL(NEW.HealthStatus,'NULL')), CURDATE());
    END IF;
END$$
DELIMITER ;

DELIMITER $$
-- Function: GetServicePrice(p_ServiceID INT) RETURNS DECIMAL(10,2)
-- Purpose: Fetches the current price of a grooming service.
-- Usage: SELECT GetServicePrice(1);
CREATE FUNCTION GetServicePrice(p_ServiceID INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE p DECIMAL(10,2);
    SELECT Price INTO p FROM GroomingService WHERE ServiceID = p_ServiceID;
    RETURN p;
END$$
DELIMITER ;

DELIMITER $$
-- Procedure: RegisterUserWithPet
-- Purpose: Creates a user and immediately registers a pet under that user in a single transaction-like unit.
-- Note: Uses LAST_INSERT_ID() to link the newly created user to the inserted pet.
CREATE PROCEDURE RegisterUserWithPet(
    IN p_Name VARCHAR(255),
    IN p_Email VARCHAR(255),
    IN p_Address VARCHAR(255),
    IN p_Phone VARCHAR(20),
    IN p_UserType ENUM('Adopter','Owner'),
    IN p_PetName VARCHAR(255),
    IN p_Breed VARCHAR(100),
    IN p_Species VARCHAR(100),
    IN p_Age INT,
    IN p_HealthStatus VARCHAR(255),
    IN p_VaccinationStatus VARCHAR(255)
)
BEGIN
    DECLARE newUserId INT;
    INSERT INTO User (Name, Email, Address, Phone, UserType)
    VALUES (p_Name, p_Email, p_Address, p_Phone, p_UserType);
    SET newUserId = LAST_INSERT_ID();
    INSERT INTO Pet (Name, Breed, Species, Age, HealthStatus, VaccinationStatus, UserID)
    VALUES (p_PetName, p_Breed, p_Species, p_Age, p_HealthStatus, p_VaccinationStatus, newUserId);
END$$
DELIMITER ;

-- Database Users and Privileges
-- Purpose: Defines application-level DB users and their privileges for security and separation of duties.
-- - admin_user: Full access for administrative tasks.
-- - staff_user: Limited access suitable for staff using the grooming/booking features.
-- Create an administrator with full rights on the database
CREATE USER IF NOT EXISTS 'admin_user'@'localhost' IDENTIFIED BY 'AdminPassword123!';
GRANT ALL PRIVILEGES ON PetAdoptionSystems.* TO 'admin_user'@'localhost';

-- Create a staff member with limited rights
CREATE USER IF NOT EXISTS 'staff_user'@'localhost' IDENTIFIED BY 'StaffPassword456!';
GRANT SELECT ON PetAdoptionSystems.Pet TO 'staff_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON PetAdoptionSystems.Booking TO 'staff_user'@'localhost';
GRANT SELECT ON PetAdoptionSystems.GroomingService TO 'staff_user'@'localhost';
GRANT SELECT ON PetAdoptionSystems.User TO 'staff_user'@'localhost';

FLUSH PRIVILEGES;

-- Insert Sample Data
-- Purpose: Provides baseline data for development and demos.
INSERT INTO User (Name, Email, Address, Phone, UserType) VALUES
('Anjali Sharma', 'anjali@email.com', '123 Koramangala, Bangalore', '9876543210', 'Owner'),
('Rohan Verma', 'rohan@email.com', '456 Indiranagar, Bangalore', '8765432109', 'Adopter');

INSERT INTO Pet (Name, Breed, Species, Age, HealthStatus, VaccinationStatus) VALUES
('Buddy', 'Golden Retriever', 'Dog', 3, 'Available', 'Up-to-date'),
('Lucy', 'Siamese', 'Cat', 2, 'Available', 'Up-to-date'),
('Rocky', 'German Shepherd', 'Dog', 5, 'Adopted', 'Up-to-date');

INSERT INTO Vet (Name, Contact, Location, Gender) VALUES
('Dr. Priya Singh', '7654321098', 'Jayanagar Vet Clinic', 'Female');

INSERT INTO Staff (Name, Contact, Role) VALUES
('Vikram Kumar', '6543210987', 'Groomer'),
('Sneha Reddy', '5432109876', 'Trainer');

INSERT INTO GroomingService (ServiceType, Price, Notes) VALUES
('Full Grooming (Bath & Haircut)', 1500.00, 'Includes nail trimming and ear cleaning'),
('Basic Bath', 700.00, 'Simple shampoo and conditioning');
