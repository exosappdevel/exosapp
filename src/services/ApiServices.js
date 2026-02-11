// src/services/ApiService.js
import { DOMParser } from 'xmldom'; // Importación necesaria para React Native

class ApiService {
  static URL_CONTROLLER = ""; 
  static PASSKEY = "";

  static init(config) {
    this.URL_CONTROLLER = config.url + "controller_ws.php";
    this.PASSKEY = config.passkey;
  }

  /**
   * Cambiamos a ApiService.parseXmlToJson (con el nombre de la clase)
   */
  static async request(action, extraData = {}) {
    const params = new URLSearchParams({
      action: action,
      key: this.PASSKEY,
      ...extraData,
    }).toString();

    const urlWithParams = `${this.URL_CONTROLLER}?${params}`;

    try {
      const response = await fetch(urlWithParams, {
        method: "GET",
        headers: {
          "Accept": "application/xml",
        }
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const xmlText = await response.text();

      // USA EL NOMBRE DE LA CLASE AQUÍ:
      return ApiService.parseXmlToJson(xmlText);

    } catch (error) {
      console.error(`Error en la acción XML [${action}]:`, error);
      throw error;
    }
  }

  /**
   * Convertidor estático de XML a Objeto
   */
  static parseXmlToJson(xmlString) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const result = {};

      // Itera sobre los nodos hijos del elemento raíz del XML
      const nodes = xmlDoc.documentElement.childNodes;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.nodeType === 1) { // Si es un elemento
          result[node.nodeName] = node.textContent;
        }
      }
      return result;
    } catch (e) {
      console.error("Error parseando XML:", e);
      return { result: "error", message: "XML inválido" };
    }
  }

  // --- MÉTODOS DE LA APP ---
  static async login(usuario, password) {
    return await this.request("inicia_sesion", {
      login_usuario: usuario,
      login_password: password
    });
  }
}

export default ApiService;