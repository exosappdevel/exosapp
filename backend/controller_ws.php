<?php
require_once "webservice/exosapp.php";

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
require_once "include/functions_ws.php";

date_default_timezone_set('America/Mexico_City');
@session_start();

class WebServiceController {
    private $exosApp;
    private $implemented;
    private $result;
    
    /**
     * Mapa de metadatos para el Auditor de Métodos
     */
    private $metodos_info = [
        'metodo_ejemplo' => [
            'descripcion' => 'Ejemplo de implementacion real.',
            'parameters'  => ['id']
        ],
        'inicia_sesion' => [
            'descripcion' => 'Valida las credenciales del usuario y genera una sesión activa.',
            'parameters'  => ['login_usuario', 'login_password']
        ],
        'get_almacenes_list'=> [
            'descripcion'=> 'obtiene la lista de almacenes',
            'parameters'=> ['id_usuario','limit (opcional)']
            ],
        'get_terminales_list' => [
            'descripcion' => 'Obtiene la lista de terminales configuradas para el proceso de picking.',
            'parameters'  => ['id_usuario','id_almacen', 'limit (opcional)']
        ],
        'get_pickeo_list' => [
            'descripcion' => 'Recupera el listado de productos y cantidades pendientes para una terminal específica.',
            'parameters'  => ['id_usuario','id_terminal', 'limit (opcional)']
        ],
        'pickeo_checkout' => [
            'descripcion' => 'Registra el avance final del pickeo y cierra la transacción de la terminal.',
            'parameters'  => ['id_usuario','id_terminal', 'datos_pickeo (JSON)']
        ]
        
    ];

    public function __construct() {
        $this->exosApp = new ExosApp_WS(); 
        $this->implemented = false;
        $this->result = [null];
        $this->run();
    }

    public function run() {
        $action = isset($_REQUEST["action"]) ? $_REQUEST["action"] : null;
        $subAction = isset($_REQUEST["sub_action"]) ? $_REQUEST["sub_action"] : null;

        if (!$action) {
            $this->sendError("Acción no especificada.");
            return;
        }

        // --- NUEVA ACCIÓN: LISTAR TODOS LOS MÉTODOS ---
        if ($action === "audit_methods") {
           $this->result =  $this->listAllMethods();
           $this->sendResponse($this->result);
           return;
        }

        // --- AUDITOR DE MÉTODO INDIVIDUAL ---
        if ( $subAction === "audit") {
            $this->result = $this->auditMethod($action);
            $this->sendResponse($this->result);
            return;
        }

        // --- FLUJO DE EJECUCIÓN (Lógica Real o Mockups) ---
        if ($this->exosApp->Implemented($action)) {
            $this->result = $this->exosApp->$action();
            $this->implemented = true;
        } else {
            $this->result = [];
            $this->implemented = false;
        }
        $metodosProhibidos = ['run', 'sendResponse', 'sendError', '__construct', 'auditMethod', 'listAllMethods'];
        
        if (method_exists($this, $action) && !in_array($action, $metodosProhibidos)) {
            $this->result = $this->$action();
            $this->sendResponse($this->result);
        } else {
            if ($this->implemented == true){
                $this->sendResponse($this->result);
            }
            else{
                $this->sendError("La acción '{$action}' no es válida.");
            }
        }
    }

    // --- UTILIDADES ---
    private function sendResponse($data) {
        $id_usuario = isset($_REQUEST["id_usuario"]) ? strval($_REQUEST["id_usuario"]) : "0";

        $input = $_SERVER['QUERY_STRING'];

        $output = XML_Envelope_Text($this->result);

        $input_esc = str_replace("'", "\'", $input);
        $output_esc = str_replace("'", "\'", $output);

        // Armamos la consulta
        $sSQL = "insert into ws_log(id, id_usuario, input, output) " .
                "values (0, " . $id_usuario . ", '" . $input_esc . "', '" . $output_esc . "')";

        ExecuteSQL_WS($sSQL ); 

        // XML_Envelope es la función encargada de transformar el array a XML
        XML_Envelope($data);
    }
    private function DatosIncorrectos(){
        $input = $_SERVER['QUERY_STRING'];
        return([
            'result' => 'error',
            'parametros' => $input,
            'result_text' => "Datos incorrectos"
        ]);       
    }
    private function sendError($message) {
        $this->sendResponse([
            'result' => 'error',
            'result_text' => $message
        ]);
    }
    /**
     * Lista todos los métodos registrados en el sistema de auditoría.
     */
    private function listAllMethods() {
        $data = [
            'result' => 'true',
            'total_methods' => count($this->metodos_info)
        ];

        $i = 0;
        foreach ($this->metodos_info as $name => $info) {
            $data['method_' . $i] = [
                'action' => $name,
                'descripcion' => $info['descripcion'],
                'parametros_count' => count($info['parameters'])
            ];
            $i++;
        }

        return($data);
    }

    /**
     * Auditoría de un método específico.
     */
    private function auditMethod($action) {
        if (isset($this->metodos_info[$action])) {
            $info = $this->metodos_info[$action];
            $data = [
                'result'      => 'true',
                'descripcion' => $info['descripcion'],
                'parameters'  => []
            ];

            foreach ($info['parameters'] as $index => $param) {
                $data['item_' . $index] = ['nombre' => $param];
            }

            return($data);
        } else {
            $this->sendError("No existe información de auditoría para la acción solicitada.");
        }
    }


    // -------------------------- IMPLEMENTACION DE LOS WEB SERVICES MOCKUP --------------------
    private function db_test(){
        try{
            $dbConx = mysqli_connect(Requesting('host'),Requesting('user'),Requesting('password'),Requesting('database'));
            $sSQL = isset($_REQUEST["sql"]) ? $_REQUEST["sql"] : "";
            $field = Requesting('field');
            $rsTemp=DatasetSQL_con($sSQL,$dbConx);
            if ($rsTemp!=null){
                $row = mysqli_fetch_array($rsTemp);
                $value = $row[$field=='' ? 0 : $field];
                return([$field=>$value]); 
            }
        }
        catch (Exception $e) {
            $id_usuario_app = 0;
            $tema = "light";
            $this->sendResponse(["exception" =>   $e->getMessage()]);
        }
    }
    // --- LOGIN ---
    public function inicia_sesion() {
        // if IMPLEMENTED 
        if ($this->implemented && $this->result != null){
           $id_usuario = $this->result["id_usuario"];
        }
        else { // ELSE USE NEXT MOCKUP
            $login_usuario = Requesting("login_usuario");
            $login_password = Requesting("login_password");

            if (!$login_usuario || !$login_password) {
                return $this->DatosIncorrectos();
            }

            // Se mantiene la lógica de tu archivo original con md5
            $query = "SELECT COUNT(u.id_usuario) AS existe, u.id_usuario, u.id_almacen, u.usuario, u.activo, a.nombre as almacen_nombre, a.codigo as almacen_codigo 
                    FROM usuario u left join almacen a on u.id_almacen=a.id_almacen
                    WHERE u.usuario = '".$login_usuario."' AND u.password = '".md5($login_password)."'";
            
            $existe = GetValueSQL($query, "existe");
            
            if($existe == 0){
                $this->sendError("Usuario o Contraseña incorrectos.");
                return;
            } 
                $id_usuario = GetValueSQL($query, "id_usuario");
                $this->result =
                        [
                            'result' => 'ok',
                            'id_usuario' => $id_usuario,
                            'id_almacen' => GetValueSQL($query, "id_almacen"),
                            'almacen_nombre' => GetValueSQL($query, "almacen_nombre"),
                            'almacen_codigo' => GetValueSQL($query, "almacen_codigo"),
                            'alias_usuario' => GetValueSQL($query, "usuario"),
                            'result_text' => 'Acceso correcto'
                        ];
        }
         
        try {
            $query = "SELECT count(id_usuario_app) as existe, u.* 
                FROM user_profile u
                WHERE id_usuario = ".$id_usuario;
        
            $existe = GetValueSQL_WS($query, "existe");
            if ($existe==0){
                $sql_new ="insert into user_profile(id_usuario_app,id_usuario) values (0,". $id_usuario .")";
                if (!ExecuteSQL_WS($sql_new)){
                    $this->result["sql_error"] = $sql_new;
                }  
            }
            
            $id_usuario_app = GetValueSQL_WS($query,"id_usuario_app");
            $tema = GetValueSQL_WS($query,"tema");
        }
        catch (Exception $e) {
            $id_usuario_app = 0;
            $tema = "light";
            $this->result["exception"] =   'Excepción recibida: '.  $e->getMessage();
        }

        $this->result["id_usuario_app"] = $id_usuario_app;
        $this->result["tema"] = $tema;


        return($this->result); 
    }

    // ---- GET ALMACENES_LIST
    public function get_almacenes_list(){   
       // if IMPLEMENTED
        if ($this->implemented && $this->result != null){
           $this->sendResponse($this->result); 
           return;
        }  
        // ELSE USE NEXT MOCKUP

        $id_usuario = Requesting("id_usuario");
    
        if (!$id_usuario) 
            return $this->DatosIncorrectos();
        $limit = !Requesting("limit") ? 10 : Requesting("limit");

        // Query original para obtener productos como terminales
        $query = "SELECT a.id_almacen, a.nombre, a.codigo 
                    FROM almacen a  
                    order by a.codigo
                    LIMIT " . $limit;	
        
        $qresult = DatasetSQL($query);
        $data = [];
        
        while ($row = mysqli_fetch_array($qresult)){
            // Usamos el prefijo 'item_' para que el XML sea válido y el frontend lo reconozca como lista
            $data['item_' . $row['id_almacen']] = [
                'id_almacen' => $row['id_almacen'],
                'nombre'      => $row['nombre'],
                'codigo' => $row['codigo']
            ];
        }

        return($data ?: ['result' => 'empty']);
    }   
    

    // --- GET TERMINALES 
    public function get_terminales_list() {
        // if IMPLEMENTED
        if ($this->implemented && $this->result != null){
           $this->sendResponse($this->result); 
           return;
        }

        // ELSE USE NEXT MOCKUP

        $id_usuario = Requesting("id_usuario");
        $id_almacen = Requesting("id_almacen");

        if (!$id_usuario || !$id_almacen) 
            return $this->DatosIncorrectos();

        $limit = !Requesting("limit") ? 5 : Requesting("limit");

        // Query original para obtener productos como terminales
        $query = "SELECT p.id_producto as id_terminal, concat('Terminal ' , p.id_producto) as terminal
                  FROM producto p 
                  LIMIT " . $limit;	
        
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

       return ($data ?: ['result' => 'empty']);
    }

    // --- GET PICKEO (RESTAURADO) ---
    public function get_pickeo_list() {
        // if IMPLEMENTED
        if ($this->implemented && $this->result != null){
           $this->sendResponse($this->result); 
           return;
        }

        // ELSE USE NEXT MOCKUP

        $id_terminal = Requesting("id_terminal");
        if (!$id_terminal) {
            return $this->DatosIncorrectos();
        }
        $limit = !Requesting("limit") ? 10 : Requesting("limit");

        // Query original solicitado para la lista de pickeo
        $query = "SELECT p.id_producto, p.nombre, p.referencia, p.codigo_1, m.marca, f.fabricante, 
                         p.id_producto as cantidad_solicitada, 0 as cantidad_recolectada, now() as last_update
                  FROM producto p 
                  LEFT JOIN marca m ON p.id_marca=m.id_marca
                  LEFT JOIN fabricante f ON m.id_fabricante=f.id_fabricante
                  LIMIT " . $limit; 

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

        return $data ?: ['result' => 'empty'];
    }
    public function pickeo_checkout() {
        // if IMPLEMENTED
        if ($this->implemented && $this->result != null){
           $this->sendResponse($this->result); 
           return;
        }

        // ELSE USE NEXT MOCKUP

        $id_terminal = Requesting("id_terminal");
        $id_usuario = Requesting("id_usuario");
        $datos_pickeo = Requesting("datos_pickeo"); // JSON enviado desde la App

        if ( !$id_usuario || !$datos_pickeo || !$id_terminal ) {
            return $this->DatosIncorrectos();
        }
        
        $sSQL = "insert into pickeo_list(id, id_usuario, id_terminal, data) " .
                " values (0," . $id_usuario . "," . $id_terminal . ",'". $datos_pickeo  ."')";
        ExecuteSQL_WS($sSQL);
        
        return [
            'result' => 'ok',
            //'sql' => $sSQL,
            'result_text' => 'Checkout procesado correctamente en ExosApp_WS'
        ];
    }
}

new WebServiceController();