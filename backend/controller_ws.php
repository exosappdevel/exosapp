<?php
// 1. Configuraciones de Cabecera (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Dependencias originales
require_once "include/functions.php";
require_once "include/db_tools.php";
require_once "lib/nusoap.php";
require_once "dompdf/autoload.inc.php";
include "assets/plugins/phpqrcode/qrlib.php";

date_default_timezone_set('America/Mexico_City');
@session_start();

class WebServiceController {

    public function __construct() {
        $this->run();
    }

    public function run() {
        // Usamos $_REQUEST para asegurar que capture 'action' tanto por GET como por POST
        $action = isset($_REQUEST["action"]) ? $_REQUEST["action"] : null;

        if (!$action) {
            $this->sendError("Acción no especificada.");
        }

        $metodosProhibidos = ['run', 'sendResponse', 'sendError', '__construct'];
        
        if (method_exists($this, $action) && !in_array($action, $metodosProhibidos)) {
            $this->$action();
        } else {
            $this->sendError("La acción '{$action}' no es válida.");
        }
    }

    // --- LOGIN ---
    public function inicia_sesion() {
        $login_usuario = Requesting("login_usuario");
        $login_password = Requesting("login_password");

        if (!$login_usuario || !$login_password) {
            $this->sendError("Usuario y contraseña requeridos.");
        }

        // Se mantiene la lógica de tu archivo original con md5
        $query = "SELECT COUNT(id_usuario) AS existe, id_usuario, usuario, id_almacen, activo 
                  FROM usuario 
                  WHERE usuario = '".$login_usuario."' AND password = '".md5($login_password)."'";
        
        $existe = GetValueSQL($query, "existe");
        
        if($existe == 0){
            $this->sendError("Usuario o Contraseña incorrectos.");
        } else {
            $id_sesion = session_id();
            $this->sendResponse([
                'result' => 'ok',
                'id_sesion' => $id_sesion,
                'alias_usuario' => GetValueSQL($query, "usuario"),
                'id_almacen' => GetValueSQL($query, "id_almacen"),
                'result_text' => 'Acceso correcto'
            ]);
        } 
    }

    // --- GET TERMINALES (RESTAURADO) ---
    public function get_terminales_list() {
        $id_sesion = Requesting("id_sesion");
        if (!$id_sesion) $this->sendError("Sesión no válida.");

        // Query original para obtener productos como terminales
        $query = "SELECT p.id_producto as id_terminal, concat('Terminal ' , p.id_producto) as terminal
                  FROM producto p 
                  LIMIT 5";	
        
        $qresult = DatasetSQL($query);
        $data = [];
        
        while ($row = mysqli_fetch_array($qresult)){
            // Usamos el prefijo 'item_' para que el XML sea válido y el frontend lo reconozca como lista
            $data['item_' . $row['id_terminal']] = [
                'id_terminal' => $row['id_terminal'],
                'nombre'      => $row['terminal'],
                'descripcion' => $row['terminal']
            ];
        }

        $this->sendResponse($data ?: ['result' => 'empty']);
    }

    // --- GET PICKEO (RESTAURADO) ---
    public function get_pickeo_list() {
        $id_terminal = Requesting("id_terminal");
        if (!$id_terminal) {
            $this->sendError("ID de terminal requerido.");
        }

        // Query original solicitado para la lista de pickeo
        $query = "SELECT p.id_producto, p.nombre, p.referencia, p.codigo_1, m.marca, f.fabricante, 
                         p.id_producto as cantidad_solicitada, 0 as cantidad_recolectada, now() as last_update
                  FROM producto p 
                  LEFT JOIN marca m ON p.id_marca=m.id_marca
                  LEFT JOIN fabricante f ON m.id_fabricante=f.id_fabricante
                  LIMIT 20"; 

        $qresult = DatasetSQL($query);
        $data = [];

        while ($row = mysqli_fetch_array($qresult)) {
            // Se usa el prefijo 'prod_' para asegurar etiquetas XML válidas
            $data['prod_' . $row['id_producto']] = [
                'id'                   => $row['id_producto'],
                'descripcion'          => $row['nombre'],
                'referencia'           => $row['referencia'],
                'marca'                => $row['marca'],
                'fabricante'           => $row['fabricante'],
                'cantidad_solicitada'  => $row['cantidad_solicitada'],
                'cantidad_recolectada' => $row['cantidad_recolectada'],
                'last_update'          => $row['last_update']
            ];
        }

        $this->sendResponse($data ?: ['result' => 'empty']);
    }

    // --- UTILIDADES ---
    private function sendResponse($data) {
        // XML_Envelope es la función encargada de transformar el array a XML
        XML_Envelope($data);
        exit;
    }

    private function sendError($message) {
        $this->sendResponse([
            'result' => 'error',
            'result_text' => $message
        ]);
    }
}

new WebServiceController();