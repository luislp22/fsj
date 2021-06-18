-- phpMyAdmin SQL Dump
-- version 4.0.4.2
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 09-03-2021 a las 20:25:23
-- Versión del servidor: 5.6.13
-- Versión de PHP: 5.4.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de datos: `mm14`
--
CREATE DATABASE IF NOT EXISTS `mm14` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `mm14`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE IF NOT EXISTS `roles` (
  `id` char(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `detalle` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `detalle`) VALUES
('69898f7b-7d26-11eb-823b-14dda97aff6e', 'administrador', 'Tiene el privilegio de crear usuarios, roles, cursos, asignar un rol a un usuario, generar cursos, asignar profesores y alumnos a un curso'),
('6989b0f2-7d26-11eb-823b-14dda97aff6e', 'profesor', 'Puede cargar contenido a un curso y evaluar a los alumnos'),
('82309a1e-7d26-11eb-823b-14dda97aff6e', 'alumno', 'rol de usuario básico que puede realizar cursos que serán evaluados por un profesor a cargo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` char(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(100) NOT NULL,
  `contrasena` varchar(100) NOT NULL,
  `rol` char(36) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `dni`, `contrasena`, `rol`) VALUES
('e91f2a84-7d25-11eb-823b-14dda97aff6e', 'luis', 'perez', '30709522', '1234', '69898f7b-7d26-11eb-823b-14dda97aff6e');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
