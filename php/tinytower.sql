-- phpMyAdmin SQL Dump
-- version 4.1.12
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Sep 08, 2014 at 01:17 PM
-- Server version: 5.6.16
-- PHP Version: 5.5.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `tinytower`
--

-- --------------------------------------------------------

--
-- Table structure for table `etage`
--

CREATE TABLE IF NOT EXISTS `etage` (
  `ID` int(25) NOT NULL AUTO_INCREMENT,
  `catID` int(5) NOT NULL,
  `name` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=13 ;

--
-- Dumping data for table `etage`
--

INSERT INTO `etage` (`ID`, `catID`, `name`) VALUES
(1, 1, 'fitness'),
(2, 1, 'swimming'),
(3, 1, 'wellness'),
(4, 2, 'clothing'),
(5, 2, 'shoes'),
(6, 2, 'electronics'),
(7, 3, 'cleaning'),
(8, 3, 'police'),
(9, 3, 'hospital'),
(10, 4, 'burgers'),
(11, 4, 'drinks'),
(12, 4, 'chinese');

-- --------------------------------------------------------

--
-- Table structure for table `etagecategories`
--

CREATE TABLE IF NOT EXISTS `etagecategories` (
  `ID` int(5) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=5 ;

--
-- Dumping data for table `etagecategories`
--

INSERT INTO `etagecategories` (`ID`, `name`) VALUES
(1, 'leisure'),
(2, 'shops'),
(3, 'services'),
(4, 'food');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `ID` int(100) NOT NULL AUTO_INCREMENT,
  `money` int(10) NOT NULL,
  `etages` varchar(500) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=2 ;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`ID`, `money`, `etages`) VALUES
(1, 9125, '4,7,1,12,5,3');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
