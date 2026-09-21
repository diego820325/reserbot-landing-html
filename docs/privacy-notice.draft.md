> Superseded for publication by `src/privacidad.html`, version 2026-09-21.
> Retained as working history and internal review notes; not included in the build.

# Privacy notice — historical working draft

Status: source draft; a review-only HTML version is included in the local build. The owner confirmed
Diego Mario Garcia Medellin as the individual controller and authorized public
use of this name. Reserbot is the product brand; no company has been formed.
Complete the remaining placeholders before publication.
The Spanish sections below are proposed customer-facing copy.

## Proposed Spanish notice

### Aviso de privacidad y tratamiento de datos personales

Fecha de entrada en vigor: [PENDIENTE].

**Responsable:** Diego Mario Garcia Medellin, persona natural responsable de Reserbot.
Domicilio: Bogotá, Colombia.
Dirección de contacto: Calle 21 # 91-50.
Teléfono de contacto: +57 310 257 41 06.
Contacto para consultas sobre tus datos: solicitudes@reserbot.co.

Al solicitar una prueba de Reserbot, proporcionas el nombre de tu barbería,
tu nombre, correo electrónico, teléfono y un enlace o usuario que identifica
tu negocio. Usaremos esta información para gestionar tu solicitud, contactarte
sobre la prueba y coordinar la configuración del servicio.

El formulario utiliza Formspree para recibir y almacenar la solicitud y enviar
una notificación por correo. Esa notificación llega mediante el reenvío de
Porkbun a una cuenta de Gmail administrada por el responsable. Estos proveedores
intervienen en el procesamiento de la información.

Formspree informa que utiliza infraestructura en Estados Unidos y puede procesar
información en otros países donde opera. También puede recoger datos técnicos,
como dirección IP y tipo de navegador, para operar y proteger el servicio.
Google indica que utiliza servidores en distintos países. Por tanto, este flujo
puede implicar procesamiento fuera de Colombia; no se ofrece almacenamiento
exclusivamente en Colombia.

Puedes consultar las políticas de [Formspree](https://formspree.io/legal/privacy-policy/),
[Porkbun](https://porkbun.com/legal/agreement/privacy_policy) y
[Google](https://policies.google.com/privacy). Estas políticas complementan la
información sobre sus servicios; no sustituyen nuestras obligaciones frente a ti.

Si tu solicitud no se convierte en una relación como cliente, eliminaremos sus
datos a los seis meses del último contacto. Este plazo es un máximo y no impide
una eliminación anterior. La eliminación abarcará las solicitudes que sigan
almacenadas en Formspree y las copias recibidas por correo.

### Tus derechos y cómo ejercerlos

Puedes acceder gratuitamente a tus datos, conocerlos, actualizarlos o corregirlos,
pedir prueba de la autorización e información sobre su uso. También puedes
solicitar la supresión o revocar la autorización cuando proceda, sin desconocer
obligaciones legales o contractuales de conservación.

Diego Mario Garcia Medellin atenderá las solicitudes en solicitudes@reserbot.co.
Indica tu nombre, el correo asociado a la solicitud, lo que necesitas y una
dirección para responderte. Para reclamos, describe los hechos y adjunta los
soportes que quieras aportar. Verificaremos tu identidad o representación con
información proporcional, sin pedir datos innecesarios.

- **Consultas:** responderemos dentro de diez días hábiles desde su recepción.
  Si necesitamos más tiempo, informaremos el motivo y la fecha de respuesta,
  con una ampliación máxima de cinco días hábiles.
- **Reclamos:** responderemos dentro de quince días hábiles contados desde el día
  siguiente a su recepción. Si no es posible, comunicaremos el motivo y la nueva
  fecha, con una ampliación máxima de ocho días hábiles.
- Si el reclamo está incompleto, pediremos completarlo dentro de los cinco días
  siguientes a su recepción. Si pasan dos meses desde ese requerimiento sin
  recibir lo solicitado, se entenderá desistido.
- Si no somos competentes, lo trasladaremos a quien corresponda en un máximo de
  dos días hábiles y te informaremos. Recibido el reclamo completo, anotaremos
  “reclamo en trámite” y su motivo dentro de dos días hábiles, hasta resolverlo.

Después de agotar la consulta o reclamo ante el responsable, puedes presentar
una queja ante la Superintendencia de Industria y Comercio.

La solicitud de prueba no incluye autorización para campañas publicitarias
ajenas a su gestión. Cualquier finalidad adicional deberá informarse y contar
con la autorización que corresponda.

### Proposed form authorization

Autorizo el tratamiento de mis datos para gestionar mi solicitud de prueba y
contactarme, conforme al aviso de privacidad.

## Publication checklist

- Controller name, domicile, contact address, and phone number confirmed by the
  owner for public use. Set the effective date when the notice is published.
- After incorporation, confirm the company's final legal name and contact details,
  review the change of controller, update this policy, and communicate the change
  to affected data subjects before or when it takes effect.
- Approved retention: non-converted trial requests are deleted six months after
  the last contact, from both Formspree and email. Earlier deletion is allowed;
  this does not promise six months of provider-side history.
- Implement a way to track last contact and perform deletion at the deadline
  across both locations. No deletion automation is currently configured.
- Define customer-record retention separately before extending this notice to
  data processed during a customer relationship.
- Public provider policies and Colombian request deadlines have been reviewed.
  Before publication, verify the contractual basis and safeguards for the actual
  international processing flow, including the personal Gmail account. Public
  privacy policies alone do not establish an executed processing agreement.
- Implement request intake, identity checks, deadline tracking, complaint flags,
  and evidence of responses. The draft describes duties, not existing automation.
- Confirm applicable jurisdiction for actual operations, including processing
  performed from Croatia (confirmed by the owner); this draft focuses on the Colombian audience.
- Review the final notice and authorization, publish a stable notice URL, link
  it beside the form, and preserve evidence of authorization as appropriate.
- Remove every placeholder. This draft does not establish legal compliance.

## Reference

- [SIC: policies and privacy notices](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/politicas-de-tratamiento-de-datos-personales).

- [Ley 1581 de 2012, articles 8, 14–16](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981).
- [Official law copy with complaint procedure](https://tramites1.suit.gov.co/registro-web/suit_descargar_archivo?A=108865).
- [Formspree privacy policy](https://formspree.io/legal/privacy-policy/).
- [Porkbun privacy policy](https://porkbun.com/legal/agreement/privacy_policy).
- [Google privacy policy](https://policies.google.com/privacy).

## Scope decision — deferred review

The owner chose to focus current work on the Colombian trial-request notice and
retain the free workflow. Additional jurisdiction/provider review is deferred to
the AWS migration; provider inquiries must remain unsent. Earlier findings remain
reference material, not active implementation prerequisites or resolved issues.
Actual operations from Croatia and processing abroad have not changed. Neither
this deferral nor migration to AWS constitutes a compliance determination.
