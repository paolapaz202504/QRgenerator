const fs = require('fs');
const path = require('path');

class ContactController {
  async submitContact(req, res) {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'El nombre es obligatorio.' });
      }
      if (!email || !email.trim() || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'El correo electrónico es inválido.' });
      }
      if (!phone || !phone.trim()) {
        return res.status(400).json({ success: false, error: 'El número de teléfono es obligatorio.' });
      }
      if (!subject || !subject.trim()) {
        return res.status(400).json({ success: false, error: 'El asunto es obligatorio.' });
      }
      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: 'El cuerpo del mensaje no puede estar vacío.' });
      }

      const contactEntry = {
        id: 'msg_' + Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
        ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        createdAt: new Date().toISOString()
      };

      console.log(`[ContactController 📩] Mensaje recibido de ${contactEntry.name} (${contactEntry.email}) - Asunto: "${contactEntry.subject}"`);

      // Persistir copia de respaldo en storage local
      try {
        const storageDir = path.join(__dirname, '..', 'storage');
        if (!fs.existsSync(storageDir)) {
          fs.mkdirSync(storageDir, { recursive: true });
        }
        const filePath = path.join(storageDir, 'contact_messages.json');
        let list = [];
        if (fs.existsSync(filePath)) {
          list = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
        }
        list.push(contactEntry);
        fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
      } catch (err) {
        console.warn('[ContactController] Error guardando copia en disco:', err.message);
      }

      return res.status(200).json({
        success: true,
        message: '¡Gracias por comunicarte con QRbey! Hemos recibido tu mensaje y nos pondremos en contacto contigo en breve.',
        id: contactEntry.id
      });
    } catch (error) {
      console.error('[ContactController] Error al procesar contacto:', error);
      return res.status(500).json({
        success: false,
        error: 'Ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.'
      });
    }
  }
}

module.exports = new ContactController();
