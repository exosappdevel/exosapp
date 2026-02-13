import { DOMParser } from 'xmldom';

class ApiService {
  static URL_CONTROLLER = ""; 
  static PASSKEY = "";

  static init(config) {
    this.URL_CONTROLLER = config.url.endsWith('/') 
      ? config.url + "controller_ws.php" 
      : config.url + "/controller_ws.php";
    this.PASSKEY = config.passkey;
  }

  static async request(action, extraData = {}) {
    const params = new URLSearchParams({ 
      action, 
      key: this.PASSKEY,
      ...extraData 
    }).toString();

    try {
      const response = await fetch(`${this.URL_CONTROLLER}?${params}`);
      const xmlText = await response.text();
      return this.parseXmlToJson(xmlText);
    } catch (error) {
      console.error("Error en request:", error);
      return { result: "error", result_text: "Error de conexión con servidor" };
    }
  }

  static parseXmlToJson(xmlString) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const nodes = xmlDoc.documentElement.childNodes;
      const list = [];
      const obj = {};
      let isList = false;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.nodeType === 1) { 
          // Detectar si el PHP envió una lista (item_ o prod_)
          if (node.nodeName.startsWith('item_') || node.nodeName.startsWith('prod_')) {
            isList = true;
            const item = {};
            for (let j = 0; j < node.childNodes.length; j++) {
              const child = node.childNodes[j];
              if (child.nodeType === 1) item[child.nodeName] = child.textContent;
            }
            list.push(item);
          } else if (node.nodeName === 'data') {
            // Si viene envuelto en <data>, procesamos sus hijos
            return this.parseXmlToJson(new XMLSerializer().serializeToString(node));
          } else {
            obj[node.nodeName] = node.textContent;
          }
        }
      }
      return isList ? list : obj;
    } catch (e) {
      return { result: "error" };
    }
  }

  static async inicia_sesion(usuario, password) {
    return await this.request("inicia_sesion", { login_usuario: usuario, login_password: password });
  }

  static async get_terminales_list(id_sesion) {
    return await this.request("get_terminales_list", { id_sesion });
  }

  static async get_pickeo_list(id_terminal) {
    return await this.request("get_pickeo_list", { id_terminal });
  }
}

export default ApiService;