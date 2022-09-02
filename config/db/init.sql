CREATE DATABASE IF NOT EXISTS matcha;
USE matcha;
CREATE TABLE IF NOT EXISTS users(
	`user_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	birthday DATE NOT NULL,
	username VARCHAR(32) NOT NULL UNIQUE,
	`password` VARCHAR(255) NOT NULL,
	`name` VARCHAR(255) DEFAULT username,
	email VARCHAR(320) NOT NULL UNIQUE,
	biography VARCHAR(4096),
	gender VARCHAR(255),
	gender_preference VARCHAR(255),
	city VARCHAR(255),
	country VARCHAR(255),
	validated BOOLEAN DEFAULT FALSE,
	profile_exists BOOLEAN DEFAULT FALSE,
	password_reset_key VARCHAR(255),
	`admin` BOOLEAN DEFAULT FALSE,
	email_notification BOOLEAN DEFAULT TRUE,
	PRIMARY KEY (`user_id`)
);
CREATE TABLE IF NOT EXISTS profiles(
	profile_id BIGINT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`user_id` INT(10) UNSIGNED NOT NULL UNIQUE,
	`name` VARCHAR(255) NOT NULL,
	profile_image VARCHAR(255) DEFAULT "default.png",
	country VARCHAR(56) NOT NULL,
	birthday DATE NOT NULL,
	city VARCHAR(85) NOT NULL,
	gender VARCHAR(32) NOT NULL,
	looking VARCHAR(32) NOT NULL,
	min_age INT(3) UNSIGNED NOT NULL,
	max_age INT(3) UNSIGNED NOT NULL,
	introduction VARCHAR(4096) NOT NULL,
	interests JSON NOT NULL,
	likes INT UNSIGNED DEFAULT 0,
	famerating INT UNSIGNED DEFAULT 0,
	latitude VARCHAR(32),
	longitude VARCHAR(32),
	`online` BOOLEAN DEFAULT FALSE,
	last_login DATETIME,
	creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (profile_id)
);

CREATE TABLE IF NOT EXISTS photos(
	photo_id BIGINT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`user_id` INT(10) UNSIGNED NOT NULL,
	`filename` VARCHAR(1024),
	creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (photo_id)
);

CREATE TABLE IF NOT EXISTS likes(
	like_id BIGINT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`user_id` INT(10) UNSIGNED NOT NULL,
	target_id INT(10) UNSIGNED NOT NULL,
	like_date DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (like_id)
);

CREATE TABLE IF NOT EXISTS matches(
	match_id BIGINT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	user1 INT(10) UNSIGNED NOT NULL,
	user2 INT(10) UNSIGNED NOT NULL,
	match_date DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (match_id)
);

CREATE TABLE IF NOT EXISTS messages(
	message_id BIGINT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	message_time DATETIME DEFAULT CURRENT_TIMESTAMP,
	match_id BIGINT(10) UNSIGNED NOT NULL,
	`user_id` INT(10) UNSIGNED NOT NULL,
	message_text text NOT NULL,
	PRIMARY KEY (message_id)
);

CREATE TABLE IF NOT EXISTS tokens(
	token_id BIGINT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`user_id` INT(10) UNSIGNED NOT NULL,
	token TEXT NOT NULL,
	PRIMARY KEY (token_id)
);

CREATE TABLE IF NOT EXISTS visitors(
	log_id BIGINT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	visited_user INT(10) UNSIGNED NOT NULL,
	visiting_user INT(10) UNSIGNED NOT NULL,
	username VARCHAR(32) NOT NULL,
	visit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (log_id)
);

CREATE TABLE IF NOT EXISTS notifications(
	notification_id BIGINT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	notification_text VARCHAR(255) NOT NULL,
	notification_type VARCHAR(16) NOT NULL,
	sender_id INT(10) UNSIGNED NOT NULL,
	receiver_id INT(10) UNSIGNED NOT NULL,
	notification_read BOOLEAN DEFAULT FALSE,
	link VARCHAR(255) NOT NULL,
	notification_time DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (notification_id)
);

CREATE TABLE IF NOT EXISTS reports(
	report_id BIGINT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	reporter INT(10) UNSIGNED NOT NULL,
	reported INT(10) UNSIGNED NOT NULL,
	report_reason INT(2) UNSIGNED NOT NULL,
	report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (report_id)
);

CREATE TABLE IF NOT EXISTS blocks(
	block_id BIGINT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	blocker INT(10) UNSIGNED NOT NULL,
	blocked INT(10) UNSIGNED NOT NULL,
	block_reason INT(2) UNSIGNED NOT NULL,
	block_date DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (block_id)
);

