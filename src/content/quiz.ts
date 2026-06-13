export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type QuizDifficulty = "basic" | "intermediate" | "advanced"

export interface Quiz {
  id: string
  label: string
  description: string
  difficulty: QuizDifficulty
  questions: QuizQuestion[]
}

const fundamentosQuestions: QuizQuestion[] = [
  {
    id: "fund-1",
    question: "¿Qué es el Virtual DOM?",
    options: [
      "Una copia del DOM real guardada en el servidor",
      "Una representación en memoria del árbol de UI que React usa para calcular los cambios mínimos",
      "Un DOM alternativo creado por el navegador para mejor rendimiento",
      "Una librería separada que reemplaza al DOM",
    ],
    correctIndex: 1,
    explanation:
      "El Virtual DOM es un árbol de objetos JavaScript que React mantiene en memoria. Antes de tocar el DOM real, compara el nuevo árbol contra el anterior (diffing) y solo aplica los cambios necesarios — proceso llamado reconciliación.",
  },
  {
    id: "fund-2",
    question: "¿Cuál es la diferencia fundamental entre state y props?",
    options: [
      "No hay diferencia, son sinónimos",
      "Props son inmutables desde dentro del componente; state es mutable y local",
      "State se pasa de padre a hijo; props son internas al componente",
      "Props solo funcionan en componentes de clase",
    ],
    correctIndex: 1,
    explanation:
      "Las props vienen del padre y el componente no las puede cambiar — son de solo lectura. El state es privado al componente y puede cambiar con setState/useState, lo que dispara un re-render.",
  },
  {
    id: "fund-3",
    question: "¿Qué pasa cuando llamas a useState con un valor inicial costoso de calcular?",
    options: [
      "Nada especial, React lo optimiza automáticamente",
      "Debes usar useMemo para envolverlo",
      "Puedes pasar una función inicializadora para que solo se ejecute una vez",
      "Debes calcularlo fuera del componente",
    ],
    correctIndex: 2,
    explanation:
      "useState acepta una función inicializadora: useState(() => computeExpensive()). React la llama solo en el primer render. Si pasas el valor directamente (useState(compute())), se recalcula en cada render aunque se descarte.",
  },
  {
    id: "fund-4",
    question: "¿Cuál es la regla más importante de los Hooks?",
    options: [
      "Solo se pueden usar en componentes de clase",
      "Solo se pueden llamar en el nivel superior del componente, nunca dentro de condicionales o loops",
      "Deben empezar con 'use' en minúsculas",
      "No se pueden combinar más de 5 hooks en un componente",
    ],
    correctIndex: 1,
    explanation:
      "React identifica el estado de cada Hook por su orden de llamada. Si los llamas dentro de condicionales o loops, ese orden puede cambiar entre renders y React perderá qué estado corresponde a qué Hook.",
  },
  {
    id: "fund-5",
    question: "¿Qué retorna useRef?",
    options: [
      "El valor actual del DOM directamente",
      "Un objeto { current } que persiste entre renders sin causar re-renders al mutar current",
      "Una función para actualizar el valor y disparar un re-render",
      "Un observable que emite cuando el valor cambia",
    ],
    correctIndex: 1,
    explanation:
      "useRef devuelve { current: initialValue }. Mutar .current no dispara re-render. Es útil para referencias al DOM, timers, o guardar valores previos sin necesidad de que el componente se actualice.",
  },
  {
    id: "fund-6",
    question: "¿Qué es JSX y cómo lo transforma el compilador?",
    options: [
      "Un lenguaje de programación nuevo creado por Meta",
      "Una extensión de sintaxis de JavaScript que Babel transforma en llamadas React.createElement()",
      "Un motor de plantillas como Handlebars o Pug",
      "Un preprocesador de CSS para componentes React",
    ],
    correctIndex: 1,
    explanation:
      "JSX no es HTML ni JavaScript puro. Babel transforma <div className='x'>Hola</div> en React.createElement('div', { className: 'x' }, 'Hola'). Es azúcar sintáctico — React puede usarse sin JSX, pero el código sería mucho menos legible.",
  },
  {
    id: "fund-7",
    question: "¿Qué son los Fragments en React y cuándo usarlos?",
    options: [
      "Componentes que no tienen estado ni props",
      "Una forma de agrupar múltiples elementos sin añadir un nodo extra al DOM",
      "Partes de código que React reutiliza entre renders automáticamente",
      "Una API para dividir la UI en partes independientes con Suspense",
    ],
    correctIndex: 1,
    explanation:
      "<></> o <React.Fragment> permite retornar múltiples elementos sin agregar un div innecesario al DOM. Es importante cuando el nodo extra rompería la semántica HTML, como en tablas (<tr> solo puede tener <td> como hijos directos) o listas Flexbox.",
  },
  {
    id: "fund-8",
    question: "¿Qué diferencia hay entre un elemento de React y un componente de React?",
    options: [
      "Son lo mismo, React los trata de forma idéntica internamente",
      "Un elemento es un objeto plano que describe la UI; un componente es la función o clase que produce esos objetos",
      "Un componente es inmutable; un elemento puede cambiar con setState",
      "Los elementos son para JSX, los componentes para React.createElement",
    ],
    correctIndex: 1,
    explanation:
      "Un elemento ({ type: 'div', props: { children: 'Hola' } }) es la descripción mínima de un nodo — un objeto plano e inmutable. Un componente es la 'fábrica' que produce elementos. React llama al componente y obtiene el árbol de elementos a renderizar.",
  },
  {
    id: "fund-9",
    question: "¿Qué son los eventos sintéticos (SyntheticEvent) en React?",
    options: [
      "Eventos creados manualmente con new CustomEvent()",
      "Una capa de abstracción sobre los eventos nativos del navegador que normaliza su comportamiento entre navegadores",
      "Eventos que solo funcionan en componentes de servidor",
      "Una forma de simular eventos en tests sin necesidad de jsdom",
    ],
    correctIndex: 1,
    explanation:
      "React envuelve los eventos nativos en SyntheticEvent para dar una API consistente entre navegadores. En React 17+ los eventos se delegan al root element en lugar del document. El sistema normaliza diferencias entre Chrome, Firefox, Safari y otros.",
  },
  {
    id: "fund-10",
    question: "¿Qué hace React.StrictMode y en qué entorno tiene efecto?",
    options: [
      "Deshabilita las advertencias en producción para mejorar el rendimiento",
      "Solo tiene efecto en desarrollo: ejecuta renders y efectos dos veces para detectar efectos secundarios inesperados",
      "Hace que el código sea tipado estáticamente como TypeScript",
      "Deshabilita el modo concurrente y usa rendering síncrono",
    ],
    correctIndex: 1,
    explanation:
      "StrictMode no afecta producción. En desarrollo, ejecuta renders y efectos dos veces intencionalmente para detectar efectos secundarios que no deberían existir, APIs deprecadas y problemas que podrían aparecer con Concurrent React. Es la primera defensa contra bugs sutiles.",
  },
]

const hooksQuestions: QuizQuestion[] = [
  {
    id: "hook-1",
    question: "useEffect con array de dependencias vacío [] se ejecuta...",
    options: [
      "En cada render",
      "Solo cuando alguna prop cambia",
      "Una sola vez después del primer render (mount)",
      "Nunca se ejecuta automáticamente",
    ],
    correctIndex: 2,
    explanation:
      "[] le dice a React: 'no hay dependencias externas'. El efecto corre una vez al montar y el cleanup corre al desmontar — equivalente a componentDidMount + componentWillUnmount.",
  },
  {
    id: "hook-2",
    question: "¿Cuál es la diferencia entre useMemo y useCallback?",
    options: [
      "No hay diferencia, son alias",
      "useMemo memoiza el resultado de una función; useCallback memoiza la función misma",
      "useCallback es más rápido que useMemo",
      "useMemo solo funciona con objetos, useCallback con primitivos",
    ],
    correctIndex: 1,
    explanation:
      "useMemo(() => compute(a, b), [a, b]) devuelve el valor calculado. useCallback(() => fn(a), [a]) devuelve la función. useCallback(fn, deps) equivale a useMemo(() => fn, deps).",
  },
  {
    id: "hook-3",
    question: "¿Cuándo tiene sentido usar useReducer en lugar de useState?",
    options: [
      "Siempre que el estado sea un número",
      "Cuando el estado tiene múltiples sub-valores relacionados o la lógica de actualización es compleja",
      "Solo cuando necesitas Redux",
      "Cuando el componente tiene más de 3 estados",
    ],
    correctIndex: 1,
    explanation:
      "useReducer brilla cuando las actualizaciones de estado dependen del estado previo de manera compleja, o cuando varios campos cambian juntos. Centraliza la lógica en un reducer puro y hace el flujo más predecible.",
  },
  {
    id: "hook-4",
    question: "¿Qué diferencia hay entre useEffect y useLayoutEffect?",
    options: [
      "useLayoutEffect no acepta cleanup",
      "useLayoutEffect se ejecuta síncronamente después del DOM pero antes de que el navegador pinte",
      "useEffect es para efectos síncronos y useLayoutEffect para asíncronos",
      "No hay diferencia en React moderno",
    ],
    correctIndex: 1,
    explanation:
      "useLayoutEffect corre después de que React actualiza el DOM pero antes del paint del navegador — ideal para leer layout o evitar flickers visuales. useEffect corre después del paint, es asíncrono y menos bloqueante.",
  },
  {
    id: "hook-5",
    question: "¿Qué hace React.memo?",
    options: [
      "Memoiza el resultado de un hook",
      "Evita re-renders de un componente si sus props no cambiaron (comparación superficial)",
      "Guarda el componente en caché del navegador",
      "Congela las props del componente para que no cambien",
    ],
    correctIndex: 1,
    explanation:
      "React.memo envuelve un componente y hace una comparación shallow de las props anteriores vs nuevas. Si son iguales, React reutiliza el resultado anterior. No ayuda si las props son objetos/funciones creados en cada render.",
  },
  {
    id: "hook-6",
    question: "¿Cómo se consume un Context con hooks?",
    options: [
      "const value = useContext(MyContext)",
      "const [value] = useState(MyContext)",
      "const value = MyContext.use()",
      "useContext solo funciona dentro de un Provider directo",
    ],
    correctIndex: 0,
    explanation:
      "useContext(MyContext) devuelve el value del Provider más cercano en el árbol. Cuando ese value cambia, el componente se re-renderiza automáticamente. Es una alternativa limpia al patrón Consumer render-prop de la API antigua.",
  },
  {
    id: "hook-7",
    question: "¿Cuándo tiene sentido extraer lógica a un hook personalizado?",
    options: [
      "Siempre que un componente supere las 100 líneas de código",
      "Cuando quieres reutilizar lógica con estado entre múltiples componentes sin duplicar código",
      "Solo cuando la lógica involucra llamadas a APIs externas",
      "Cuando necesitas acceder al DOM directamente desde varios componentes",
    ],
    correctIndex: 1,
    explanation:
      "Un hook personalizado es una función que empieza con 'use' y puede llamar otros hooks. Extraes lógica stateful (useWindowSize, useFetch, useLocalStorage) para reutilizarla sin cambiar la jerarquía de componentes — algo que HOC y render props no logran con la misma limpieza.",
  },
  {
    id: "hook-8",
    question: "¿Qué hace useDeferredValue?",
    options: [
      "Devuelve una versión diferida de un valor que se actualiza con menor prioridad para mantener la UI responsiva",
      "Cancela el setState si el componente se desmonta antes de recibir la respuesta",
      "Memoriza un valor calculado hasta que cambien sus dependencias",
      "Sincroniza un valor entre el servidor y el cliente durante la hidratación",
    ],
    correctIndex: 0,
    explanation:
      "useDeferredValue(value) devuelve una versión del valor que se actualiza con menor prioridad. Útil para inputs donde el campo debe responder inmediatamente pero la lista filtrada puede mostrar el valor anterior mientras recalcula — sin debounce manual.",
  },
  {
    id: "hook-9",
    question: "¿Qué resuelve useImperativeHandle?",
    options: [
      "Permite al padre invocar métodos específicos expuestos por un componente hijo a través de una ref",
      "Maneja errores de hooks de forma imperativa en lugar de declarativa",
      "Reemplaza a useEffect para manipulaciones directas del DOM",
      "Hace que un componente hijo controle el estado del padre",
    ],
    correctIndex: 0,
    explanation:
      "useImperativeHandle(ref, () => ({ focus, reset }), deps) define qué métodos expone el hijo a la ref del padre. Se usa junto con forwardRef. Permite APIs imperativas (.focus(), .scroll(), .reset()) sin exponer todo el nodo DOM ni el estado interno del hijo.",
  },
  {
    id: "hook-10",
    question: "¿Qué problema resuelve useTransition?",
    options: [
      "Gestiona animaciones CSS dentro de componentes React",
      "Marca actualizaciones de estado como no urgentes para que React priorice inputs y clicks sobre ellas",
      "Administra transiciones de rutas en React Router",
      "Retrasa efectos hasta después del primer render visible",
    ],
    correctIndex: 1,
    explanation:
      "const [isPending, startTransition] = useTransition(). Al envolver un setState en startTransition, React lo marca como no urgente. Si llega una actualización urgente (un keystroke), React la procesa primero. isPending indica que la transición está pendiente para mostrar feedback visual.",
  },
]

const patronesQuestions: QuizQuestion[] = [
  {
    id: "pat-1",
    question: "¿Qué problema principal resuelve el patrón Render Props?",
    options: [
      "Mejora el rendimiento evitando re-renders",
      "Comparte lógica con estado entre componentes sin herencia",
      "Reemplaza completamente a los hooks",
      "Permite acceder al DOM directamente",
    ],
    correctIndex: 1,
    explanation:
      "Render Props permite que un componente delegue qué renderizar pasando una función como prop. Esto comparte lógica con estado (ej: posición del mouse) entre componentes distintos. Hoy los hooks suelen ser la alternativa más limpia.",
  },
  {
    id: "pat-2",
    question: "¿Qué es un Higher-Order Component (HOC)?",
    options: [
      "Un componente que tiene más de 100 líneas",
      "Una función que recibe un componente y retorna uno nuevo con funcionalidad extendida",
      "Un componente padre que controla todos los estados",
      "Un componente que usa todos los hooks disponibles",
    ],
    correctIndex: 1,
    explanation:
      "Un HOC es una función pura: toma un componente, lo envuelve con lógica adicional y retorna el componente mejorado. Ejemplo: withAuth(Component). Son un patrón de composición, no de la API de React.",
  },
  {
    id: "pat-3",
    question: "¿Qué es prop drilling?",
    options: [
      "Pasar props usando el operador spread en cada componente",
      "Pasar props por componentes intermedios que no las necesitan solo para que lleguen a un componente profundo",
      "Usar demasiadas props en un mismo componente",
      "Pasar funciones como props entre componentes hermanos",
    ],
    correctIndex: 1,
    explanation:
      "Prop drilling es cuando pasas datos por componentes intermedios solo para que lleguen a un componente profundo. El problema: los componentes intermedios tienen acoplamiento innecesario. Soluciones: Context, composición (children), o state managers.",
  },
  {
    id: "pat-4",
    question: "¿Por qué es importante la prop key en listas?",
    options: [
      "Solo es requerida por TypeScript para tipado seguro",
      "Mejora el SEO de la lista",
      "Permite a React identificar qué elemento cambió, se agregó o se eliminó durante la reconciliación",
      "Es solo una convención, React funciona igual sin ella",
    ],
    correctIndex: 2,
    explanation:
      "Sin key estable, React usa la posición del elemento para reconciliar — y puede reutilizar el nodo equivocado al reordenar. Con key única y estable, React puede mover, agregar y eliminar elementos eficientemente.",
  },
  {
    id: "pat-5",
    question: "¿Qué es un componente controlado en formularios?",
    options: [
      "Un componente que no permite al usuario editarlo",
      "Un componente cuyo valor es controlado por React a través del state, no por el DOM",
      "Un componente que valida su propio input automáticamente",
      "Un componente que se controla desde un componente padre siempre",
    ],
    correctIndex: 1,
    explanation:
      "En un componente controlado, el state de React es la 'fuente de verdad'. El input recibe value={state} y onChange actualiza el state. El DOM refleja React, no al revés. Lo opuesto es no controlado, donde el DOM maneja su propio estado.",
  },
  {
    id: "pat-6",
    question: "¿Qué es el patrón Compound Components?",
    options: [
      "Combinar múltiples APIs externas en un único componente facade",
      "Un patrón donde componentes hijos colaboran con el padre compartiendo estado implícito vía Context",
      "Anidar más de tres niveles de componentes para dividir responsabilidades",
      "Crear componentes que mezclan lógica de negocio y UI en el mismo archivo",
    ],
    correctIndex: 1,
    explanation:
      "Compound Components (ej: <Select><Select.Option/></Select>) exponen un conjunto de sub-componentes que se comunican implícitamente con el padre a través de Context. El padre controla el estado compartido; los hijos lo consumen. Da flexibilidad al usuario de la API sin prop drilling.",
  },
  {
    id: "pat-7",
    question: "¿Qué significa 'levantar el estado' (Lifting State Up)?",
    options: [
      "Mover la declaración de useState al inicio del archivo para mayor claridad",
      "Mover el estado al ancestro común más cercano cuando dos componentes necesitan compartirlo",
      "Convertir estado local en global usando un store centralizado",
      "Usar useReducer en lugar de useState para mayor jerarquía de acciones",
    ],
    correctIndex: 1,
    explanation:
      "Si dos componentes hermanos necesitan el mismo dato, lo subes al padre común y lo pasas como props. Es la solución de React antes de Context. La decisión entre 'levantar' vs Context depende de cuántos niveles de la jerarquía necesitas atravesar.",
  },
  {
    id: "pat-8",
    question: "¿Qué son los Portals en React?",
    options: [
      "Una API para precargar rutas y componentes en Next.js",
      "Una forma de renderizar hijos en un nodo del DOM fuera de la jerarquía del componente padre",
      "Componentes que se renderizan en un iframe aislado del resto de la app",
      "Puntos de entrada alternativos para Server Components en arquitecturas multi-zona",
    ],
    correctIndex: 1,
    explanation:
      "ReactDOM.createPortal(child, container) renderiza en el nodo DOM indicado, pero el componente sigue siendo parte del árbol de React — Context, eventos y demás funcionan con normalidad. Ideal para modales, tooltips y overlays que deben vivir en document.body pero pertenecer lógicamente al componente.",
  },
  {
    id: "pat-9",
    question: "¿Cuál es la ventaja de la composición sobre la herencia en React?",
    options: [
      "La composición es más rápida que la herencia en el motor de JavaScript V8",
      "React no soporta herencia de clases en componentes funcionales",
      "La composición con children y props es más flexible y evita el acoplamiento rígido de las jerarquías de clases",
      "La herencia genera re-renders adicionales que la composición evita",
    ],
    correctIndex: 2,
    explanation:
      "El equipo de React recomienda composición sobre herencia. En lugar de MyComponent extends BaseComponent, usas <Container><Child/></Container> o props render. Obtienes reúso sin acoplamiento fuerte, colisiones de métodos ni la rigidez de las jerarquías de clases.",
  },
  {
    id: "pat-10",
    question: "¿Qué es un componente no controlado (uncontrolled) y cuándo usarlo?",
    options: [
      "Un componente que no recibe ninguna prop del padre",
      "Un componente donde el DOM gestiona su propio estado, accedido mediante refs cuando se necesita",
      "Un componente que no tiene validación de tipos en sus props",
      "Un componente que puede recibir eventos del sistema operativo directamente",
    ],
    correctIndex: 1,
    explanation:
      "En un componente no controlado el estado del input vive en el DOM. Usas ref para leer el valor solo cuando lo necesitas (ej: al hacer submit). Es más simple para integraciones con código no-React y casos donde no necesitas validación en tiempo real.",
  },
]

const avanzadoQuestions: QuizQuestion[] = [
  {
    id: "adv-1",
    question: "¿Qué garantiza React al usar startTransition?",
    options: [
      "Que la actualización se ejecuta en un Web Worker para no bloquear el hilo principal",
      "Que la actualización es urgente y se procesa antes que cualquier otra",
      "Que la actualización puede ser interrumpida si llega una actualización más urgente",
      "Que el componente no se re-renderiza hasta que la transición termina",
    ],
    correctIndex: 2,
    explanation:
      "startTransition marca una actualización como no urgente. React puede interrumpirla si aparece algo urgente (como un keystroke). Esto evita que actualizaciones pesadas bloqueen la UI — el hilo principal sigue siendo uno solo.",
  },
  {
    id: "adv-2",
    question: "¿Cuál es la diferencia entre un React Server Component y un Client Component?",
    options: [
      "Los Server Components se renderizan en el servidor y nunca envían JavaScript al cliente; los Client Components sí",
      "Los Server Components son más rápidos porque usan WebSockets en lugar de HTTP",
      "Los Client Components solo funcionan en el navegador; los Server Components funcionan en ambos lados",
      "No hay diferencia real, es solo una convención de nombres",
    ],
    correctIndex: 0,
    explanation:
      "Los RSC se ejecutan exclusivamente en el servidor — su código nunca llega al bundle del cliente. Pueden acceder a bases de datos y archivos directamente. Los Client Components ('use client') se hidratan en el navegador y pueden usar estado, efectos y eventos.",
  },
  {
    id: "adv-3",
    question: "¿Qué problema resuelve useOptimistic en React 19?",
    options: [
      "Permite cancelar actualizaciones de estado que aún no se confirmaron",
      "Muestra un estado provisional inmediatamente mientras una acción asíncrona está en curso, luego lo reemplaza con el resultado real",
      "Optimiza los re-renders de listas largas usando virtualización automática",
      "Precarga los datos de la siguiente ruta antes de que el usuario navegue",
    ],
    correctIndex: 1,
    explanation:
      "useOptimistic permite aplicar un cambio de UI de forma inmediata (optimista) sin esperar la respuesta del servidor. Si la operación falla, React revierte al estado real. Es ideal para likes, ediciones inline y cualquier acción que quieras que se sienta instantánea.",
  },
  {
    id: "adv-4",
    question:
      "¿Por qué pasar un nuevo objeto como value a un Context en cada render es problemático?",
    options: [
      "Viola las reglas de los Hooks",
      "Hace que todos los consumidores del Context se re-rendericen aunque los datos no hayan cambiado",
      "Rompe la comparación de identidad de React.memo",
      "Solo es problemático si el objeto tiene más de 10 propiedades",
    ],
    correctIndex: 1,
    explanation:
      "React compara el value del Context por referencia. Si el padre hace <Ctx.Provider value={{ a, b }}>, crea un objeto nuevo en cada render — referencia distinta — y todos los consumidores se re-renderizan. La solución es memoizar el value con useMemo.",
  },
  {
    id: "adv-5",
    question: "¿Qué es el React Compiler (antes React Forget)?",
    options: [
      "Un transpilador que convierte JSX a JavaScript puro sin necesidad de Babel",
      "Una herramienta que compila componentes de React a WebAssembly para mayor rendimiento",
      "Un compilador que inserta automáticamente useMemo y useCallback donde son necesarios, eliminando re-renders innecesarios",
      "Un plugin de TypeScript que valida el uso correcto de los hooks en tiempo de compilación",
    ],
    correctIndex: 2,
    explanation:
      "React Compiler analiza el código en tiempo de build y agrega memoización automática donde detecta que el valor no cambia. El objetivo es que los desarrolladores no tengan que pensar en useMemo/useCallback manualmente. Disponible en React 19 como opt-in.",
  },
  {
    id: "adv-6",
    question: "¿Cuándo un Error Boundary NO captura un error?",
    options: [
      "Cuando el error ocurre en el render de un componente hijo",
      "Cuando el error ocurre dentro de un event handler, código asíncrono o el propio Error Boundary",
      "Cuando el componente usa hooks en lugar de ser una clase",
      "Cuando el error proviene de una librería externa",
    ],
    correctIndex: 1,
    explanation:
      "Los Error Boundaries solo capturan errores en el render, en métodos del ciclo de vida y en constructores de componentes hijos. No capturan errores en event handlers (usa try/catch ahí), código asíncrono (setTimeout, fetch) ni en el propio boundary.",
  },
  {
    id: "adv-7",
    question: "¿Qué hace Suspense en combinación con lazy()?",
    options: [
      "Congela el render del árbol completo hasta que el componente lazy carga",
      "Muestra el fallback mientras el bundle del componente lazy se está descargando, luego lo reemplaza",
      "Precarga todos los componentes lazy al iniciar la aplicación",
      "Hace que los componentes lazy carguen en paralelo siempre",
    ],
    correctIndex: 1,
    explanation:
      "lazy() carga el componente de forma diferida (code splitting). Cuando React intenta renderizarlo y el bundle aún no llegó, 'suspende' ese subárbol y muestra el fallback del Suspense más cercano. Cuando carga, React renderiza el componente real.",
  },
  {
    id: "adv-8",
    question:
      "¿Qué ocurre con el estado de un componente cuando React lo desmonta y lo vuelve a montar?",
    options: [
      "El estado se preserva porque React lo guarda en el Virtual DOM",
      "El estado se resetea completamente — React destruye y recrea la instancia",
      "El estado se preserva solo si usas useRef en lugar de useState",
      "React muestra un warning pero preserva el estado por defecto",
    ],
    correctIndex: 1,
    explanation:
      "React vincula el estado al árbol de componentes, no al componente como entidad. Cuando un componente se desmonta, su estado desaparece. Al montar de nuevo, empieza desde cero. Cambiar la key de un componente fuerza este ciclo intencionalmente.",
  },
  {
    id: "adv-9",
    question: "¿Cuál es el propósito de useId en React 18+?",
    options: [
      "Generar IDs únicos estables entre el servidor y el cliente para evitar errores de hidratación",
      "Crear identificadores únicos para las keys de listas dinámicas",
      "Reemplazar a crypto.randomUUID() en entornos sin acceso a la API Web",
      "Asignar un ID único a cada instancia de un hook personalizado",
    ],
    correctIndex: 0,
    explanation:
      "useId genera un ID único y estable que coincide entre el render del servidor y la hidratación del cliente. Es ideal para atributos como htmlFor/id en formularios. No debe usarse como key de lista — para eso necesitas IDs de tus datos.",
  },
  {
    id: "adv-10",
    question: "¿Qué son las Actions en React 19?",
    options: [
      "Un reemplazo de Redux para manejar estado global sin librerías externas",
      "Funciones que se pasan a elementos de formulario para manejar envíos de forma asíncrona, con estados de pending y error integrados",
      "Eventos personalizados que reemplazan a los event handlers de React",
      "Una API para despachar actualizaciones de estado desde fuera de los componentes",
    ],
    correctIndex: 1,
    explanation:
      "Las Actions son funciones (sync o async) que puedes pasar al atributo action de un <form>. React maneja automáticamente el estado de pending con useFormStatus y los errores. Eliminan el patrón manual de isLoading/error en formularios.",
  },
]

const rendimientoQuestions: QuizQuestion[] = [
  {
    id: "perf-1",
    question: "¿Cuándo React evita re-renderizar un componente automáticamente?",
    options: [
      "Nunca: React siempre re-renderiza todos los hijos cuando el padre cambia",
      "Cuando el componente está envuelto en React.memo y sus props no cambiaron por referencia",
      "Cuando el componente no tiene ningún estado propio",
      "Cuando el componente está fuera del viewport actual",
    ],
    correctIndex: 1,
    explanation:
      "Por defecto, cuando un padre se re-renderiza, todos sus hijos lo hacen también. React.memo añade una comparación shallow de props: si las referencias son iguales, React reutiliza el resultado anterior y salta el render del hijo.",
  },
  {
    id: "perf-2",
    question: "¿Qué es el code splitting y cómo se implementa en React?",
    options: [
      "Dividir el CSS en múltiples archivos para descarga paralela",
      "Dividir el bundle de JavaScript en chunks que se cargan bajo demanda con React.lazy() + Suspense",
      "Separar la lógica de negocio de la UI en archivos distintos",
      "Una técnica de compilación para dividir un componente grande en varios más pequeños",
    ],
    correctIndex: 1,
    explanation:
      "React.lazy(() => import('./Component')) crea un componente que carga su bundle solo cuando se necesita. Envuelto en <Suspense fallback={...}>, React muestra el fallback mientras descarga el chunk. Reduce el bundle inicial y mejora el Time to Interactive.",
  },
  {
    id: "perf-3",
    question: "¿Para qué sirve el React Profiler?",
    options: [
      "Analiza el código en busca de vulnerabilidades de seguridad en tiempo de compilación",
      "Mide la frecuencia y el costo de renders de componentes para identificar cuellos de botella",
      "Monitorea el uso de memoria heap en producción",
      "Genera reportes de cobertura de tests de los componentes",
    ],
    correctIndex: 1,
    explanation:
      "El Profiler (DevTools y la API <Profiler onRender={...}>) mide cuánto tardó cada componente, cuántas veces se renderizó y por qué cambió. Es el primer paso de cualquier optimización — nunca optimices sin medir primero.",
  },
  {
    id: "perf-4",
    question: "¿Cuándo NO deberías usar useMemo?",
    options: [
      "Cuando el cálculo tarda más de 1ms en ejecutarse",
      "Para todos los objetos y arrays que se crean en el render",
      "Cuando el cálculo es trivial o las dependencias cambian en prácticamente todos los renders",
      "useMemo siempre mejora el rendimiento, no hay casos donde no usarlo",
    ],
    correctIndex: 2,
    explanation:
      "useMemo tiene un costo: React ejecuta comparaciones de dependencias en cada render y guarda el valor en memoria. Si el cálculo es barato (sumar dos números) o las dependencias cambian constantemente, useMemo añade overhead sin beneficio real.",
  },
  {
    id: "perf-5",
    question: "¿Cómo funciona el automatic batching de React 18?",
    options: [
      "React 18 ejecuta los renders en un Web Worker para no bloquear el hilo principal",
      "React agrupa múltiples setState en un solo re-render, incluso dentro de fetch, setTimeout y eventos nativos",
      "React aplaza todos los setState hasta el próximo frame de animación con requestAnimationFrame",
      "React cancela renders intermedios si llega un setState más reciente antes de que el render termine",
    ],
    correctIndex: 1,
    explanation:
      "Antes de React 18, el batching solo ocurría en event handlers de React. React 18 introduce automatic batching: múltiples setState dentro de promises, setTimeout o cualquier código asíncrono se agrupan en un solo re-render. Menos renders = mejor rendimiento.",
  },
  {
    id: "perf-6",
    question: "¿Qué es la virtualización (windowing) y cuándo es necesaria?",
    options: [
      "Usar iframes para aislar secciones de la UI y mejorar el rendimiento de renderizado",
      "Renderizar solo los elementos visibles de una lista larga, no todos al mismo tiempo",
      "Una técnica de CSS para acelerar animaciones delegándolas a la GPU",
      "Ejecutar componentes React en un contexto virtual aislado del DOM real",
    ],
    correctIndex: 1,
    explanation:
      "Con miles de items, renderizar todos crea miles de nodos DOM — lento e ineficiente. Windowing (react-window, TanStack Virtual) renderiza solo las filas visibles más un buffer. El DOM tiene pocas decenas de nodos y el scroll es fluido sin importar cuántos datos haya.",
  },
  {
    id: "perf-7",
    question: "¿Qué impacto tiene crear funciones inline en JSX de un componente memoizado?",
    options: [
      "Ninguno, React detecta funciones funcionalmente equivalentes y las trata como iguales",
      "Rompe la memoización porque cada render del padre crea una nueva referencia de función",
      "Solo es problemático en componentes de clase, no en funcionales",
      "Las funciones inline son más rápidas que las definidas fuera del render",
    ],
    correctIndex: 1,
    explanation:
      "<Button onClick={() => doSomething()} /> crea una función nueva en cada render del padre. Si Button usa React.memo, la prop onClick siempre tiene referencia diferente → React.memo no puede evitar el re-render. Solución: useCallback para estabilizar la referencia.",
  },
  {
    id: "perf-8",
    question: "¿Qué efecto tiene cambiar la prop key de un componente intencionalmente?",
    options: [
      "Solo actualiza el atributo HTML key del nodo DOM subyacente",
      "Fuerza a React a desmontar el componente y montar uno nuevo, reseteando completamente su estado",
      "Mejora el rendimiento del reconciliador al dar una pista de identidad estable",
      "Hace que el componente ignore las props del render anterior",
    ],
    correctIndex: 1,
    explanation:
      "Cambiar la key (ej: <Form key={userId} />) le dice a React que es un componente diferente al anterior. Desmonta el viejo (ejecutando cleanup de efectos) y monta uno nuevo con estado desde cero. Es la forma idiomática de resetear un componente sin lógica manual.",
  },
]

const listasYKeysQuestions: QuizQuestion[] = [
  {
    id: "lyk-1",
    question:
      "¿Por qué es peligroso usar el índice del array como key cuando la lista puede reordenarse?",
    options: [
      "Porque React prohíbe el uso del índice como key",
      "Porque el índice cambia al reordenar, haciendo que React reutilice el DOM del elemento incorrecto",
      "Porque los índices no son únicos entre hermanos",
      "Porque el índice es un número y la key debe ser un string",
    ],
    correctIndex: 1,
    explanation:
      "La key le dice a React qué elemento del DOM corresponde a qué dato. Si usas el índice y reordenas la lista, el elemento 0 ahora representa otro dato pero React reutiliza el nodo DOM anterior — causa bugs en inputs, animaciones y estado de componentes.",
  },
  {
    id: "lyk-2",
    question: "¿Cuál es la forma correcta de renderizar una lista de nombres en JSX?",
    options: [
      "nombres.forEach(n => <li>{n}</li>)",
      "nombres.map(n => <li key={n}>{n}</li>)",
      "<for name in nombres><li>{name}</li></for>",
      "nombres.filter(n => <li>{n}</li>)",
    ],
    correctIndex: 1,
    explanation:
      "JSX acepta arrays de elementos. map retorna un array nuevo, por lo que es la herramienta natural para listas. Cada elemento del array debe tener key única. forEach no retorna nada — no sirve en JSX. No existe <for> en JSX.",
  },
  {
    id: "lyk-3",
    question:
      "¿Qué problema concreto ocurre al renderizar {count && <span>texto</span>} cuando count es 0?",
    options: [
      "Nada, el componente no se renderiza",
      "React lanza un error porque 0 no es un booleano",
      "Se renderiza el número 0 en la pantalla porque 0 es falsy pero React lo muestra igual",
      "El span aparece igual porque 0 es truthy en JSX",
    ],
    correctIndex: 2,
    explanation:
      "El operador && retorna el operando izquierdo si es falsy. React renderiza 0 (número) pero no renderiza false ni null. La solución: usar count > 0 && <span/> o un ternario. Es uno de los bugs más comunes en renderizado condicional.",
  },
  {
    id: "lyk-4",
    question: "¿Dónde debe colocarse la prop key al usar map?",
    options: [
      "En el primer elemento hijo del componente que se mapea",
      "En el elemento raíz que retorna el map, no en un elemento hijo interno",
      "En el elemento HTML más externo del árbol completo",
      "Puede ponerse en cualquier nivel, React la busca automáticamente",
    ],
    correctIndex: 1,
    explanation:
      "La key debe estar en el elemento raíz del map. Si el map retorna <li><span key={id}>...</span></li>, la key está en el lugar equivocado. Debe ser <li key={id}>...</li>. React usa la key para reconciliar el nivel del map, no los hijos internos.",
  },
  {
    id: "lyk-5",
    question: "¿Cuál es la diferencia práctica entre retornar null y false en JSX?",
    options: [
      "No hay diferencia, ambos ocultan el componente sin dejar rastro en el DOM",
      "null oculta sin renderizar nada; false también, pero algunos linters prefieren null por claridad",
      "false renderiza un nodo DOM vacío; null no renderiza nada",
      "null cierra el Portal más cercano; false cancela el render completo",
    ],
    correctIndex: 1,
    explanation:
      "Tanto null como false hacen que React no renderice nada al DOM. La diferencia es semántica: null comunica 'aquí no hay nada intencionalmente', false comunica una condición no cumplida. undefined también funciona. La convención es usar null para elementos opcionales.",
  },
  {
    id: "lyk-6",
    question: "¿Cuándo usar el operador ternario en lugar de && para renderizado condicional?",
    options: [
      "Siempre, el ternario es más seguro que &&",
      "Cuando quieres mostrar un elemento alternativo si la condición es falsa",
      "Solo cuando la condición es un booleano estricto",
      "Cuando el componente tiene más de un nivel de anidamiento",
    ],
    correctIndex: 1,
    explanation:
      "Si solo necesitas mostrar algo o nada, && es suficiente (con cuidado de los valores falsy). Si necesitas A o B según la condición, el ternario condición ? <A/> : <B/> es la herramienta correcta. Ambos son válidos en sus casos de uso.",
  },
  {
    id: "lyk-7",
    question:
      "¿La key debe ser única en todo el árbol de React o solo entre hermanos del mismo nivel?",
    options: [
      "Única en todo el árbol — dos componentes con la misma key causan conflictos",
      "Única solo entre los hermanos directos del mismo map o lista",
      "Única dentro del mismo componente padre",
      "Única globalmente en la aplicación para evitar colisiones",
    ],
    correctIndex: 1,
    explanation:
      "La key solo necesita ser única entre los hermanos directos del mismo conjunto. Dos listas distintas pueden usar perfectamente los mismos valores de key sin conflictos. React compara las keys solo dentro del mismo contexto de reconciliación.",
  },
  {
    id: "lyk-8",
    question: "¿Cómo mostrar un mensaje 'Sin resultados' cuando una lista filtrada está vacía?",
    options: [
      "items.length === 0 ? <p>Sin resultados</p> : items.map(...)",
      "items.map(...) || <p>Sin resultados</p>",
      "!items && <p>Sin resultados</p>",
      "items.length < 1 ?? <p>Sin resultados</p>",
    ],
    correctIndex: 0,
    explanation:
      "El ternario es la forma más directa: si la longitud es 0, muestra el mensaje alternativo; si no, renderiza la lista. items.map(...) || ... no funciona porque map retorna un array vacío [] que es truthy. El operador ?? es para null/undefined, no para arrays.",
  },
  {
    id: "lyk-9",
    question: "¿Puede un componente retornar un array de elementos directamente (sin Fragment)?",
    options: [
      "No, el componente siempre debe retornar un único elemento raíz",
      "Sí, retornar un array de elementos JSX es válido, pero cada elemento debe tener key",
      "Solo si usa TypeScript con el tipo correcto",
      "Solo desde React 18 con la nueva API de retorno múltiple",
    ],
    correctIndex: 1,
    explanation:
      "Un componente puede retornar un array: return [<A key='a'/>, <B key='b'/>]. Es válido aunque poco común porque los Fragments son más legibles. Si retornas un array, cada elemento necesita key igual que en un map.",
  },
  {
    id: "lyk-10",
    question: "¿Qué hace React cuando la misma key aparece dos veces en el mismo nivel?",
    options: [
      "Lanza un error en producción y detiene el render",
      "Muestra solo el primer elemento con esa key",
      "Emite un warning en desarrollo y puede mostrar comportamiento inesperado en el DOM",
      "Los fusiona en un único nodo DOM para mayor eficiencia",
    ],
    correctIndex: 2,
    explanation:
      "React emite un warning en consola pero no lanza un error. Sin embargo, el comportamiento es indefinido: puede renderizar solo uno de los duplicados o comportarse de forma impredecible durante la reconciliación. Las keys duplicadas rompen la garantía de identidad estable.",
  },
]

const formulariosQuestions: QuizQuestion[] = [
  {
    id: "frm-1",
    question: "¿Qué hace e.preventDefault() en el handler de onSubmit de un formulario?",
    options: [
      "Detiene la propagación del evento hacia los componentes padre",
      "Evita el comportamiento por defecto del navegador de recargar la página al enviar el formulario",
      "Cancela el evento de submit y vacía los inputs automáticamente",
      "Impide que el formulario valide sus campos nativos del navegador",
    ],
    correctIndex: 1,
    explanation:
      "Sin preventDefault(), al hacer submit el navegador recarga la página — el comportamiento HTTP por defecto de los formularios. En React manejamos el submit con JavaScript, así que necesitamos evitar ese comportamiento nativo para procesar los datos sin recarga.",
  },
  {
    id: "frm-2",
    question: "¿Por qué un input con value={texto} pero sin onChange es problemático?",
    options: [
      "Causa un error de TypeScript porque value requiere onChange",
      "El input queda en modo de solo lectura: el usuario no puede escribir aunque lo intente",
      "El valor no se actualiza en el estado, pero el input funciona normalmente",
      "React ignora el value si no hay onChange definido",
    ],
    correctIndex: 1,
    explanation:
      "React controla el valor del input mediante el state. Si hay value pero no onChange, React sobreescribe el input con el valor del state en cada render — impidiendo que el usuario escriba. React mostrará un warning. La solución: añadir onChange, o usar defaultValue para modo no controlado.",
  },
  {
    id: "frm-3",
    question: "¿Cuál es la diferencia entre value y defaultValue en un input?",
    options: [
      "value controla el estado en tiempo real (controlado); defaultValue establece el valor inicial sin control de React (no controlado)",
      "defaultValue es para inputs de tipo text; value para checkboxes",
      "value se usa en formularios de login; defaultValue en formularios de registro",
      "No hay diferencia práctica entre ambos",
    ],
    correctIndex: 0,
    explanation:
      "value convierte el input en controlado: React es la fuente de verdad y actualiza el DOM en cada render. defaultValue solo establece el valor inicial y luego el DOM maneja su propio estado — es para componentes no controlados. No se mezclan en el mismo input.",
  },
  {
    id: "frm-4",
    question: "¿Cómo se maneja correctamente un checkbox controlado en React?",
    options: [
      "Usar value={checked} y onChange para actualizar el estado",
      "Usar checked={booleano} y onChange que actualice el booleano con e.target.checked",
      "Los checkboxes no pueden ser controlados en React, solo no controlados",
      "Usar onClick en lugar de onChange para detectar cambios",
    ],
    correctIndex: 1,
    explanation:
      "Los checkboxes usan checked (no value) para el modo controlado. El handler debe leer e.target.checked — un booleano — no e.target.value. Ejemplo: <input type='checkbox' checked={activo} onChange={e => setActivo(e.target.checked)} />",
  },
  {
    id: "frm-5",
    question: "¿Cómo leer todos los valores de un formulario no controlado en el evento submit?",
    options: [
      "Acceder a e.target.children y recorrer los inputs",
      "Usar new FormData(e.target) y llamar a .get('nombreDelCampo')",
      "Leer document.getElementById para cada campo",
      "Los formularios no controlados no pueden leerse en el submit",
    ],
    correctIndex: 1,
    explanation:
      "new FormData(event.target) recoge todos los campos con atributo name del formulario. formData.get('email') devuelve el valor actual. Es la forma idiomática para formularios no controlados en React — evita gestionar el estado de cada campo con useState.",
  },
  {
    id: "frm-6",
    question: "¿Cuándo tiene sentido usar un formulario no controlado sobre uno controlado?",
    options: [
      "Siempre que el formulario tenga más de 3 campos",
      "Cuando no necesitas validación en tiempo real ni leer el valor antes del submit",
      "Solo en formularios de búsqueda, nunca en formularios de datos importantes",
      "Cuando el formulario usa estilos CSS personalizados",
    ],
    correctIndex: 1,
    explanation:
      "Los formularios no controlados son más simples cuando solo necesitas el valor en el submit. Si necesitas validar mientras el usuario escribe, mostrar caracteres restantes, o activar/desactivar el botón submit en tiempo real, el formulario controlado con useState es la mejor opción.",
  },
  {
    id: "frm-7",
    question: "¿Cómo resetear un formulario controlado a sus valores iniciales?",
    options: [
      "Llamar a e.target.reset() dentro del handler del formulario",
      "Actualizar el estado de cada campo al valor inicial (ej: setEmail(''))",
      "Cambiar la key del formulario para que React lo desmonte y vuelva a montar",
      "Tanto B como C son válidos según el caso",
    ],
    correctIndex: 3,
    explanation:
      "En un formulario controlado, el estado de React ES el formulario. Para resetear: actualiza todos los estados al valor inicial (opción B). La opción C (cambiar key) fuerza un remontaje completo y también resetea — útil si el formulario tiene muchos campos o estado complejo interno.",
  },
  {
    id: "frm-8",
    question: "¿Cómo manejar múltiples inputs controlados sin un useState por campo?",
    options: [
      "No es posible — cada campo necesita su propio useState",
      "Usar un objeto en el estado y actualizar con spread en onChange usando e.target.name",
      "Usar useReducer solo si hay más de 5 campos",
      "Dejar los inputs no controlados y leer con refs en el submit",
    ],
    correctIndex: 1,
    explanation:
      "Un objeto de estado es la solución más común: const [form, setForm] = useState({ email: '', password: '' }). En onChange: setForm(f => ({ ...f, [e.target.name]: e.target.value })). Con el atributo name en cada input, un solo handler sirve para todos los campos.",
  },
  {
    id: "frm-9",
    question: "¿Qué evento se usa para detectar cambios en un <select> controlado?",
    options: [
      "onInput — onChange solo funciona con inputs de texto",
      "onChange — igual que en inputs de texto, React normaliza el comportamiento",
      "onSelect — evento específico de los elementos <select>",
      "onClick — porque el usuario hace click en la opción",
    ],
    correctIndex: 1,
    explanation:
      "React normaliza onChange para todos los elementos de formulario: input text, checkbox, radio, select y textarea. El valor está en e.target.value igual que en un input de texto. React mapea esto a los eventos nativos correspondientes de cada elemento.",
  },
  {
    id: "frm-10",
    question:
      "¿Cómo deshabilitar el botón de submit mientras el formulario tiene errores de validación?",
    options: [
      "Usar CSS pointer-events: none en el botón",
      "Calcular hasErrors a partir del estado y pasar disabled={hasErrors} al botón",
      "Añadir required a los inputs para que el navegador lo gestione",
      "Interceptar el onClick del botón y no llamar a submit si hay errores",
    ],
    correctIndex: 1,
    explanation:
      "La forma idiomática en React: derivar la validez del formulario del estado actual (sin almacenar isValid en el estado) y pasar disabled={hasErrors} al botón. Esto es un componente controlado llevado hasta el botón submit. required del navegador tiene comportamiento limitado y difícil de personalizar.",
  },
]

const efectosBasicosQuestions: QuizQuestion[] = [
  {
    id: "efb-1",
    question: "¿Cuándo se ejecuta useEffect sin array de dependencias (sin segundo argumento)?",
    options: [
      "Solo en el primer render",
      "En cada render del componente",
      "Solo cuando las props cambian",
      "Solo cuando el estado cambia",
    ],
    correctIndex: 1,
    explanation:
      "Sin array de dependencias, useEffect se ejecuta después de cada render. Incluye el primer render y todos los re-renders posteriores. Es equivalente a no tener ninguna optimización — úsalo solo si realmente necesitas que el efecto corra siempre.",
  },
  {
    id: "efb-2",
    question: "¿Para qué sirve la función que retorna useEffect (la función de cleanup)?",
    options: [
      "Para indicarle a React cuándo el efecto terminó de ejecutarse",
      "Para limpiar suscripciones, timers o listeners antes de que el efecto se vuelva a ejecutar o el componente se desmonte",
      "Para capturar errores que ocurran dentro del efecto",
      "Para resetear el estado del componente a su valor inicial",
    ],
    correctIndex: 1,
    explanation:
      "React llama al cleanup antes de ejecutar el efecto nuevamente (si las dependencias cambiaron) y cuando el componente se desmonta. Es esencial para clearInterval, clearTimeout, removeEventListener y cancelar suscripciones. Sin cleanup, acumulas recursos que nunca se liberan.",
  },
  {
    id: "efb-3",
    question: "¿Por qué no se puede marcar la función de useEffect directamente como async?",
    options: [
      "React no soporta async/await dentro de efectos",
      "Una función async retorna una Promise, pero useEffect espera una función de cleanup o undefined — no una Promise",
      "Async dentro de useEffect causa loops infinitos",
      "Es una limitación temporal que se resolverá en React 20",
    ],
    correctIndex: 1,
    explanation:
      "Si la función de useEffect es async, retorna una Promise. React espera void o una función de cleanup. La solución: definir una función async interna y llamarla inmediatamente: useEffect(() => { async function load() { ... } load(); }, []).",
  },
  {
    id: "efb-4",
    question: "¿Qué ocurre si actualizas el estado dentro de useEffect con [] como dependencias?",
    options: [
      "React lanza un error de dependencias faltantes",
      "El estado se actualiza una vez al montar — no causa loop porque las dependencias son vacías",
      "Causa un loop infinito porque el setState dispara un re-render que ejecuta el efecto de nuevo",
      "El cambio de estado se ignora dentro de useEffect con []",
    ],
    correctIndex: 1,
    explanation:
      "Con [], el efecto solo corre en el montaje. Actualizar estado dentro no causa loop porque React no vuelve a ejecutar el efecto (las dependencias vacías no cambian). El re-render ocurre, pero el efecto no se re-ejecuta. El loop infinito ocurriría sin el [] o con el estado actualizado como dependencia.",
  },
  {
    id: "efb-5",
    question: "¿Cuántas veces se ejecuta useEffect con [] en React.StrictMode en desarrollo?",
    options: [
      "Una vez, StrictMode no afecta los efectos",
      "Dos veces — React monta, desmonta y vuelve a montar intencionalmente para detectar efectos no idempotentes",
      "Tres veces para mayor certeza estadística",
      "Depende del navegador y del modo concurrent",
    ],
    correctIndex: 1,
    explanation:
      "StrictMode ejecuta el ciclo mount → unmount → mount en desarrollo para verificar que tu cleanup funciona correctamente. Si tu efecto tiene efectos secundarios no revertibles (analytics, mutaciones de BD), se detectan aquí. En producción solo corre una vez.",
  },
  {
    id: "efb-6",
    question: "¿Qué es una 'stale closure' en el contexto de useEffect?",
    options: [
      "Un efecto que no tiene cleanup y deja recursos sin liberar",
      "Cuando el efecto captura el valor de una variable en el momento de crearse y no ve las actualizaciones posteriores",
      "Un efecto que tarda demasiado y bloquea el render",
      "Cuando se usa useEffect fuera de un componente React",
    ],
    correctIndex: 1,
    explanation:
      "Las closures capturan valores del momento en que se crean. Si tienes useEffect con [] y lees count dentro, siempre verás 0 (el valor inicial). La solución: incluir count en las dependencias o usar actualización funcional (setCount(c => c + 1)) que no necesita el valor capturado.",
  },
  {
    id: "efb-7",
    question: "¿Cuándo se ejecuta el cleanup de un useEffect con dependencias [userId]?",
    options: [
      "Solo cuando el componente se desmonta",
      "Antes de cada re-ejecución del efecto (cuando userId cambia) y también cuando el componente se desmonta",
      "Después de cada ejecución del efecto",
      "Solo si el efecto lanzó un error",
    ],
    correctIndex: 1,
    explanation:
      "El cleanup corre en dos momentos: (1) cuando el componente se desmonta, y (2) justo antes de que el efecto se vuelva a ejecutar por un cambio en las dependencias. Esto garantiza que al cambiar userId, cancelamos la petición anterior antes de lanzar la nueva.",
  },
  {
    id: "efb-8",
    question: "¿Es correcto tener múltiples useEffect en un mismo componente?",
    options: [
      "No, solo puede haber uno por componente — usa un único useEffect con toda la lógica",
      "Sí, y es una buena práctica separar efectos por responsabilidad",
      "Sí, pero solo si tienen diferentes arrays de dependencias",
      "Solo en componentes de clase, no en funcionales",
    ],
    correctIndex: 1,
    explanation:
      "Tener múltiples useEffect es la práctica recomendada. Cada efecto debería tener una sola responsabilidad. Separar el efecto del fetch del efecto de un event listener hace el código más legible, testeable y con cleanups independientes. React los ejecuta en orden de declaración.",
  },
  {
    id: "efb-9",
    question:
      "¿Qué problema tiene incluir un objeto creado en el render como dependencia de useEffect?",
    options: [
      "Ninguno, React compara objetos por valor profundo",
      "El objeto tiene una referencia nueva en cada render, causando que el efecto corra en cada render aunque los datos sean iguales",
      "TypeScript lanza un error de tipo porque las dependencias deben ser primitivos",
      "React serializa el objeto y lo compara como JSON automáticamente",
    ],
    correctIndex: 1,
    explanation:
      "React compara dependencias por referencia (Object.is). Un objeto literal { id: 1 } crea una nueva referencia en cada render, aunque tenga el mismo contenido. El efecto corre en cada render como si no hubiera dependencias. Solución: usar primitivos como dependencias (el id, no el objeto) o memoizar con useMemo.",
  },
  {
    id: "efb-10",
    question: "¿Cuál es la forma correcta de hacer fetch dentro de useEffect?",
    options: [
      "useEffect(async () => { const data = await fetch(...) }, [])",
      "useEffect(() => { fetch(...).then(r => r.json()).then(setData) }, [])",
      "useEffect(() => { async function load() { const r = await fetch(...); setData(await r.json()); } load(); }, [])",
      "Las opciones B y C son ambas válidas",
    ],
    correctIndex: 3,
    explanation:
      "Tanto B (.then() encadenado) como C (función async interna llamada de inmediato) son válidos. La opción A no funciona porque la función async retorna una Promise en lugar de undefined o cleanup. C es preferida cuando hay múltiples awaits porque es más legible.",
  },
]

const estadoBasicoQuestions: QuizQuestion[] = [
  {
    id: "stb-1",
    question: "¿Por qué no debes mutar el estado directamente (ej: state.count = 5)?",
    options: [
      "React lanzará un TypeError si detecta la mutación",
      "La mutación no dispara un re-render porque React no detecta cambios en la misma referencia",
      "Es solo una convención de estilo, funcionaría igual",
      "Las mutaciones son más lentas que usar setState",
    ],
    correctIndex: 1,
    explanation:
      "React detecta cambios comparando referencias. Si mutas el objeto sin crear uno nuevo, la referencia es la misma — React asume que no cambió nada y no re-renderiza. Siempre crea un nuevo objeto/array: setItems([...items, nuevoItem]) en lugar de items.push(nuevoItem).",
  },
  {
    id: "stb-2",
    question:
      "¿Cuándo necesitas usar la forma funcional setCount(c => c + 1) en lugar de setCount(count + 1)?",
    options: [
      "Siempre — la forma funcional es siempre mejor",
      "Cuando el nuevo valor depende del valor actual y puede haber múltiples actualizaciones en el mismo ciclo",
      "Solo cuando el componente usa useCallback o useMemo",
      "Solo en loops o setTimeout",
    ],
    correctIndex: 1,
    explanation:
      "Si llamas a setCount varias veces en el mismo handler, cada llamada con setCount(count + 1) usa el valor capturado en el render — siempre el mismo. Con setCount(c => c + 1), React aplica cada actualización al valor más reciente. Tres incrementos consecutivos deben sumar 3, no 1.",
  },
  {
    id: "stb-3",
    question:
      "¿Qué hace React si llamas a setState con exactamente el mismo valor que ya tiene el estado?",
    options: [
      "Re-renderiza igual porque no puede saber si algo cambió",
      "Puede omitir el re-render si comprueba que el nuevo valor es el mismo (bailout)",
      "Lanza un warning diciendo que el estado no cambió",
      "Actualiza el estado pero no el DOM",
    ],
    correctIndex: 1,
    explanation:
      "React usa Object.is para comparar el nuevo estado con el anterior. Si son iguales, React puede saltar el re-render del componente (bailout). Para primitivos esto es muy eficiente. Para objetos, aunque el contenido sea igual, si es una referencia nueva, React re-renderiza.",
  },
  {
    id: "stb-4",
    question: "¿Cómo actualizar correctamente un campo de un objeto en el estado?",
    options: [
      "state.email = nuevoEmail; setState(state)",
      "setState({ email: nuevoEmail }) — React fusiona el nuevo valor con el anterior",
      "setState(prev => ({ ...prev, email: nuevoEmail })) — spread del objeto anterior más el campo actualizado",
      "setState(Object.assign(state, { email: nuevoEmail }))",
    ],
    correctIndex: 2,
    explanation:
      "useState no fusiona objetos automáticamente (a diferencia de setState de clase). Debes hacer el spread manualmente: { ...prev, email: nuevoEmail }. La opción A muta el estado. La opción B sobrescribe todo el estado con solo email. La opción D muta el objeto antes de pasarlo a setState.",
  },
  {
    id: "stb-5",
    question: "¿Qué es el 'estado derivado' y cuándo no necesitas useState para él?",
    options: [
      "Estado que proviene de props — siempre debe almacenarse en useState",
      "Un valor calculable directamente a partir del estado o props existentes — no necesitas useState, se calcula en el render",
      "Estado que se inicializa a partir de una prop — necesita su propio useState",
      "Estado que depende de una petición HTTP asíncrona",
    ],
    correctIndex: 1,
    explanation:
      "Si puedes calcular un valor a partir del estado existente, no lo guardes en otro useState. Ejemplo: si tienes items[], no necesitas const [count, setCount] = useState(items.length) — simplemente usa const count = items.length en el render. Duplicar estado derivado causa inconsistencias.",
  },
  {
    id: "stb-6",
    question:
      "¿Qué garantiza React sobre el agrupamiento (batching) de múltiples setState en React 18?",
    options: [
      "Solo agrupa setState dentro de event handlers de React, nunca en setTimeout o fetch",
      "Agrupa todos los setState en un solo re-render, incluso dentro de setTimeout, promesas y eventos nativos",
      "Agrupa setState solo si los llamas en la misma línea de código",
      "No garantiza nada — el batching es una optimización opcional del motor JS",
    ],
    correctIndex: 1,
    explanation:
      "React 18 introdujo automatic batching: múltiples setState en cualquier contexto asíncrono (setTimeout, fetch, promises) se agrupan en un único re-render. Antes de React 18, el batching solo ocurría en event handlers de React. Más batching = menos re-renders = mejor rendimiento.",
  },
  {
    id: "stb-7",
    question: "¿Dos instancias del mismo componente comparten su estado?",
    options: [
      "Sí, el estado está vinculado al tipo de componente, no a la instancia",
      "No, cada instancia del componente tiene su propio estado completamente independiente",
      "Solo si están en el mismo componente padre",
      "Solo si usan el mismo nombre de variable en useState",
    ],
    correctIndex: 1,
    explanation:
      "El estado de React está vinculado a la posición en el árbol de componentes, no al componente como tipo. Dos <Contador /> en el árbol son instancias independientes con su propio estado. Cambiar el count de uno no afecta al otro. Para compartir estado, debes levantarlo a un ancestro común.",
  },
  {
    id: "stb-8",
    question: "¿Cuál es el orden correcto de los valores que retorna useState?",
    options: [
      "[setter, value] — primero el setter para seguir la convención de hooks",
      "[value, setter] — primero el valor actual, luego la función para actualizarlo",
      "{ value, set } — un objeto con las dos propiedades",
      "Depende de si se pasa valor inicial o función inicializadora",
    ],
    correctIndex: 1,
    explanation:
      "useState retorna siempre un array de dos elementos: [valorActual, funcionSetteadora]. La convención de destructuring es const [count, setCount] = useState(0). El orden es fijo — valor primero, setter segundo. No hay variante de objeto.",
  },
  {
    id: "stb-9",
    question: "¿Cómo actualizar correctamente un array de objetos en el estado?",
    options: [
      "items[0].done = true; setItems(items)",
      "setItems(items.map(item => item.id === id ? { ...item, done: true } : item))",
      "setItems(items.splice(0, 1, { ...items[0], done: true }))",
      "items.forEach(item => { if (item.id === id) item.done = true }); setItems(items)",
    ],
    correctIndex: 1,
    explanation:
      "Debes crear un nuevo array y nuevos objetos para los items modificados — nunca mutar. map retorna un nuevo array. Para el item que cambia: { ...item, done: true } crea un nuevo objeto. Las opciones A y D mutan el estado. splice muta el array original.",
  },
  {
    id: "stb-10",
    question: "¿Cuándo ocurre el re-render de un componente en React?",
    options: [
      "Solo cuando setState es llamado con un valor diferente",
      "Cuando cambia el estado propio, cuando cambian las props, o cuando el componente padre se re-renderiza (sin React.memo)",
      "Solo cuando el usuario interactúa con el componente",
      "En cada animationFrame del navegador para mantener la UI sincronizada",
    ],
    correctIndex: 1,
    explanation:
      "Un componente se re-renderiza por tres razones: (1) su propio estado cambió, (2) sus props cambiaron, o (3) su padre se re-renderizó y el componente no está envuelto en React.memo. El re-render recalcula el JSX — React luego compara con el Virtual DOM anterior y aplica solo los cambios reales al DOM.",
  },
]

const contextoQuestions: QuizQuestion[] = [
  {
    id: "ctx-1",
    question: "¿Cuál es el propósito principal de la API Context de React?",
    options: [
      "Reemplazar completamente a Redux y otras librerías de estado global",
      "Pasar datos directamente a componentes profundos del árbol sin prop drilling",
      "Sincronizar el estado entre el servidor y el cliente en tiempo real",
      "Crear stores de estado inmutable como alternativa a useReducer",
    ],
    correctIndex: 1,
    explanation:
      "Context resuelve el prop drilling: pasar datos por componentes intermedios que no los necesitan. Es ideal para datos globales de la sesión como tema, locale o usuario autenticado. No es un reemplazo general de Redux — para lógica compleja con muchas actualizaciones, un state manager dedicado puede ser mejor.",
  },
  {
    id: "ctx-2",
    question: "¿Qué valor recibe useContext(MiContexto) cuando no hay ningún Provider en el árbol?",
    options: [
      "null siempre",
      "undefined siempre",
      "El defaultValue pasado a createContext() cuando se creó el contexto",
      "Lanza un error automáticamente porque el Provider es obligatorio",
    ],
    correctIndex: 2,
    explanation:
      "createContext(defaultValue) — el defaultValue es el fallback cuando no hay Provider. Si no pasas nada, el default es undefined. React no lanza error automáticamente; si quieres forzar el Provider, hazlo en el hook personalizado: if (!ctx) throw new Error('Requiere Provider').",
  },
  {
    id: "ctx-3",
    question: "¿Cuándo se re-renderiza un consumidor de Context?",
    options: [
      "Solo cuando el componente padre se re-renderiza",
      "Cada vez que el value del Provider cambia, independientemente de si el padre se re-renderizó",
      "Cada vez que cualquier componente del árbol cambia su estado",
      "Solo si el consumidor también tiene su propio useState",
    ],
    correctIndex: 1,
    explanation:
      "Todos los consumidores de un Context se re-renderizan cuando el value del Provider cambia — usando comparación por referencia (Object.is). Esto es independiente del re-render del padre. React.memo no evita los re-renders causados por cambios en el Context.",
  },
  {
    id: "ctx-4",
    question:
      "¿Por qué <MiCtx.Provider value={{ tema, setTema }}> puede causar re-renders innecesarios?",
    options: [
      "Porque los objetos literales no están permitidos como value del Provider",
      "Porque un objeto literal crea una referencia nueva en cada render del padre, aunque tema no haya cambiado",
      "Porque el Provider no acepta setTema como parte del value — debe ir en otra prop",
      "Porque React compara objetos por valor profundo y eso tiene un costo alto",
    ],
    correctIndex: 1,
    explanation:
      "{ tema, setTema } crea un objeto nuevo en cada render del padre del Provider. Referencia nueva → todos los consumidores se re-renderizan aunque tema sea el mismo. La solución: memoizar el value con useMemo(() => ({ tema, setTema }), [tema]).",
  },
  {
    id: "ctx-5",
    question: "¿Puede un componente consumir múltiples Contexts al mismo tiempo?",
    options: [
      "No, un componente solo puede suscribirse a un Context a la vez",
      "Sí, usando múltiples llamadas a useContext() — una por cada Context",
      "Solo si los Contexts están relacionados y fueron creados juntos",
      "Solo si se envuelven en un HOC que combina los Contexts",
    ],
    correctIndex: 1,
    explanation:
      "Un componente puede llamar a useContext() tantas veces como necesite: const { tema } = useContext(TemaCtx); const { usuario } = useContext(AuthCtx). Cada llamada suscribe el componente al Context correspondiente de forma independiente.",
  },
  {
    id: "ctx-6",
    question:
      "¿Cuál es la estrategia para evitar que componentes que solo leen setTema se re-rendericen cuando tema cambia?",
    options: [
      "Es imposible — cualquier consumidor del Context se re-renderiza cuando el value cambia",
      "Separar el Context en dos: uno para el valor (tema) y otro para el setter (setTema)",
      "Usar React.memo en los consumidores de setTema",
      "Pasar setTema directamente como prop en lugar de por Context",
    ],
    correctIndex: 1,
    explanation:
      "Si separas ThemeContext (solo el valor) de ThemeDispatchContext (solo el setter), los componentes que solo leen setTema no se re-renderizan cuando el tema cambia porque están suscritos al Context del setter — que tiene referencia estable ya que setTema no cambia entre renders.",
  },
  {
    id: "ctx-7",
    question: "¿Puede haber múltiples instancias del mismo Provider anidadas en el árbol?",
    options: [
      "No, solo puede haber un Provider por Context en toda la aplicación",
      "Sí, y cada uno puede tener un value diferente — los consumidores usarán el Provider más cercano",
      "Sí, pero los valores se fusionan automáticamente con merge profundo",
      "Solo en modo de desarrollo, no en producción",
    ],
    correctIndex: 1,
    explanation:
      "Puedes anidar múltiples Providers del mismo Context con diferentes values. Cada consumidor usará el Provider más cercano hacia arriba en el árbol. Esto es útil para sobreescribir valores en subtemas de la UI (ej: tema oscuro dentro de una sección concreta de la app).",
  },
  {
    id: "ctx-8",
    question: "¿Cuál es la principal limitación de Context para gestión de estado global complejo?",
    options: [
      "Solo puede almacenar strings y números, no objetos complejos",
      "Cualquier cambio en el value re-renderiza todos los consumidores, sin granularidad fina por campo",
      "No funciona con componentes de clase",
      "Solo puede usarse una vez en la aplicación",
    ],
    correctIndex: 1,
    explanation:
      "Context no tiene selectores. Si el value es { usuario, preferencias, carrito }, cambiar solo el carrito re-renderiza TODOS los consumidores — incluso los que solo leen usuario. Librerías como Zustand o Jotai tienen selectores que limitan los re-renders a los consumidores del dato específico que cambió.",
  },
  {
    id: "ctx-9",
    question:
      "¿Qué retorna useContext cuando el componente está dentro del Provider pero su value es undefined?",
    options: [
      "El defaultValue de createContext, porque React hace fallback automático",
      "undefined — el value del Provider tiene prioridad sobre el defaultValue de createContext",
      "null, porque React normaliza undefined a null en los Contexts",
      "Lanza un error porque undefined no es un value válido para un Provider",
    ],
    correctIndex: 1,
    explanation:
      "Cuando hay un Provider, su value siempre tiene prioridad — incluso si es undefined. El defaultValue de createContext solo se usa cuando NO hay ningún Provider en el árbol. <MiCtx.Provider value={undefined}> → useContext retorna undefined, no el defaultValue.",
  },
  {
    id: "ctx-10",
    question: "¿Cuál es la forma recomendada de exponer un Context a los consumidores?",
    options: [
      "Exportar el objeto Context directamente y que cada consumidor llame a useContext",
      "Crear un hook personalizado (ej: useTheme) que llama a useContext internamente y valida el Provider",
      "Exportar el Provider y dejar que cada consumidor cree su propio Context local",
      "Usar un HOC para inyectar el Context como props a los componentes que lo necesiten",
    ],
    correctIndex: 1,
    explanation:
      "El patrón recomendado: exporta el Provider y un hook personalizado (useTheme, useAuth) que llama a useContext internamente. El hook puede validar que hay Provider, ocultar detalles de implementación y añadir lógica derivada. Los consumidores llaman a useTheme() en lugar de manejar el Context directamente.",
  },
]

const compoundComponentsQuestions: QuizQuestion[] = [
  {
    id: "cc-1",
    question: "¿Qué problema resuelve principalmente el patrón Compound Components?",
    options: [
      "Eliminar el uso de useState en componentes hijos",
      "Evitar prop drilling y permitir APIs flexibles para el consumidor",
      "Mejorar el rendimiento evitando re-renders innecesarios",
      "Separar la lógica de negocio de la vista",
    ],
    correctIndex: 1,
    explanation:
      "Con un componente clásico basado en props (items={[...]}), el consumidor solo puede pasar datos pero no controlar la estructura. Compound Components transfieren esa flexibilidad al consumidor: puede decidir el orden, el contenido y el layout de cada subcomponente sin que el autor tenga que anticiparlo.",
  },
  {
    id: "cc-2",
    question:
      "¿Cómo se comunican los subcomponentes con el padre en el patrón Compound Components?",
    options: [
      "A través de props explícitas pasadas de padre a hijo",
      "Usando eventos DOM nativos con dispatchEvent",
      "A través de un Context privado que el padre provee",
      "Mediante variables globales del módulo",
    ],
    correctIndex: 2,
    explanation:
      "El padre crea un Context y envuelve a sus hijos en un Provider con el estado compartido. Los subcomponentes llaman a useContext para leerlo sin necesitar props explícitas. El Context es privado — solo los subcomponentes que forman parte de la API lo consumen.",
  },
  {
    id: "cc-3",
    question: "¿Cómo se adjuntan habitualmente los subcomponentes al componente padre?",
    options: [
      "Se exportan como componentes independientes sin relación con el padre",
      "Se registran en un array interno de children permitidos",
      "Se añaden como propiedades estáticas del padre (Accordion.Item, Tabs.Panel)",
      "Se envuelven en un HOC que los conecta automáticamente al padre",
    ],
    correctIndex: 2,
    explanation:
      "La convención es adjuntar los subcomponentes como propiedades estáticas: Accordion.Item = AccordionItem. Esto agrupa visualmente la API, comunica al consumidor que esos componentes están diseñados para usarse juntos y permite el autocompletado del IDE.",
  },
  {
    id: "cc-4",
    question:
      "¿Qué ventaja tiene lanzar un error en el hook personalizado cuando se usa fuera del Provider?",
    options: [
      "Mejora el rendimiento al detectar errores antes del render",
      "Proporciona un mensaje claro que ayuda al desarrollador a encontrar el problema rápidamente",
      "Evita que React muestre el error boundary más cercano",
      "Es obligatorio para que Context funcione correctamente",
    ],
    correctIndex: 1,
    explanation:
      "Sin la comprobación if (!ctx) throw new Error('...'), si alguien usa <Accordion.Trigger> fuera de <Accordion>, el código falla con un error críptico de null reference. Lanzar 'useAccordion debe usarse dentro de <Accordion>' convierte un bug difícil de rastrear en un error inmediatamente accionable.",
  },
  {
    id: "cc-5",
    question:
      "En un Accordion con Compound Components, ¿para qué se necesita un segundo nivel de Context (ItemCtx)?",
    options: [
      "Para mejorar el rendimiento evitando re-renders del árbol completo",
      "Para que Trigger y Panel conozcan su id sin recibir props explícitas",
      "Para separar el estado del Accordion en múltiples stores independientes",
      "Para permitir que cada item tenga su propio estado abierto/cerrado independiente",
    ],
    correctIndex: 1,
    explanation:
      "AccordionCtx provee el estado global (qué item está activo, función toggle). ItemCtx provee el id del item actual a sus hijos. Sin ItemCtx, Trigger y Panel tendrían que recibir el id como prop, rompiendo la API sin props. Dos niveles de contexto, cada uno con una responsabilidad clara.",
  },
  {
    id: "cc-6",
    question:
      "¿Cuál es la diferencia principal entre Compound Components y pasar la configuración como items={[...]} props?",
    options: [
      "Los Compound Components son más performantes porque evitan renders adicionales",
      "Los Compound Components permiten al consumidor controlar el layout y el contenido de cada parte",
      "Las props son menos verbosas y más mantenibles a largo plazo",
      "Los Compound Components requieren menos código en la implementación",
    ],
    correctIndex: 1,
    explanation:
      "Con items={[...]} la estructura está fijada por el autor del componente. Con Compound Components, el consumidor decide el orden, qué renderizar dentro de cada subcomponente, e incluso puede mezclar con otros elementos. La flexibilidad pasa del autor al consumidor.",
  },
  {
    id: "cc-7",
    question:
      "¿Qué ocurre si se omite la comprobación if (!ctx) throw new Error(...) en el hook personalizado?",
    options: [
      "TypeScript lanza un error de compilación antes de ejecutar el código",
      "React muestra automáticamente el error boundary más cercano con un mensaje útil",
      "El componente falla con un error críptico de null reference en lugar de un mensaje claro",
      "Context devuelve un objeto vacío por defecto y el componente no renderiza",
    ],
    correctIndex: 2,
    explanation:
      "Sin la validación, ctx es null y el primer acceso a ctx.active lanza Cannot read properties of null — un error que no indica dónde está el problema real. La comprobación explícita transforma ese error críptico en un mensaje accionable desde el primer momento.",
  },
  {
    id: "cc-8",
    question:
      "¿Cuál de los siguientes es un ejemplo real del patrón Compound Components en HTML nativo?",
    options: [
      "<div className='container'>",
      "<form onSubmit={handler}>",
      "<select><option value='1'>Uno</option></select>",
      "<input type='text' />",
    ],
    correctIndex: 2,
    explanation:
      "select + option es el Compound Component original del HTML. select gestiona el valor seleccionado; option es el subcomponente que se comunica implícitamente con su padre. Librerías como Radix UI, React Aria y Headless UI siguen exactamente este mismo patrón.",
  },
  {
    id: "cc-9",
    question: "¿En qué se diferencia el patrón Compound Components del patrón Render Props?",
    options: [
      "Render Props usa Context y Compound Components usa props directas",
      "Compound Components usa JSX declarativo; Render Props expone lógica a través de una función",
      "Compound Components solo sirve para componentes de UI; Render Props para lógica de negocio",
      "No hay diferencias relevantes, son patrones completamente equivalentes",
    ],
    correctIndex: 1,
    explanation:
      "Ambos comparten estado con el consumidor, pero de distinta forma. Render Props: <Mouse render={(pos) => <Cat {...pos} />} — flexible pero verboso. Compound Components: <Tabs><Tabs.List>...</Tabs.List></Tabs> — declarativo, legible y con estructura JSX natural. Compound Components suele preferirse cuando el consumidor controla el layout.",
  },
  {
    id: "cc-10",
    question:
      "¿Por qué el Context usado en Compound Components generalmente es privado (no exportado)?",
    options: [
      "Por limitaciones técnicas de React que impiden exportarlo desde un módulo",
      "Para evitar que el consumidor acople su código a detalles internos de implementación",
      "Porque exportar Context causa memory leaks en producción",
      "Por requisitos de rendimiento del React Compiler",
    ],
    correctIndex: 1,
    explanation:
      "El Context es un detalle de implementación. Exportarlo permitiría que el consumidor lo usara directamente, acoplando su código a la estructura interna. Si el autor reestructura el componente (por ejemplo, dividiendo un Context en dos), rompería todo el código consumidor. Exportar solo el hook personalizado (useAccordion) mantiene una API pública limpia y estable.",
  },
]

const errorBoundaryQuestions: QuizQuestion[] = [
  {
    id: "eb-1",
    question:
      "¿Qué método de ciclo de vida se encarga de mostrar la UI de fallback cuando ocurre un error?",
    options: [
      "componentDidCatch",
      "getDerivedStateFromError",
      "componentDidUpdate",
      "getSnapshotBeforeUpdate",
    ],
    correctIndex: 1,
    explanation:
      "getDerivedStateFromError es un método estático y puro que React llama durante la fase de render cuando un hijo lanza un error. Devuelve el nuevo estado (por ejemplo, { hasError: true }) que provoca el re-render con el fallback. componentDidCatch se llama después, en la fase de commit, y es para side effects como logging.",
  },
  {
    id: "eb-2",
    question: "¿Para qué sirve componentDidCatch en un Error Boundary?",
    options: [
      "Para actualizar el estado y mostrar el fallback UI",
      "Para prevenir que el error se propague al componente padre",
      "Para ejecutar side effects como logging o reportar el error a un servicio de monitoreo",
      "Para reintentar el render del componente que falló automáticamente",
    ],
    correctIndex: 2,
    explanation:
      "componentDidCatch recibe el error y un objeto ErrorInfo con componentStack. Se ejecuta en la fase de commit (después del render), por eso es el lugar correcto para side effects: console.error, enviar a Sentry, Datadog, etc. No debe usarse para actualizar estado — eso es responsabilidad de getDerivedStateFromError.",
  },
  {
    id: "eb-3",
    question: "¿Por qué un Error Boundary debe ser una clase y no un componente funcional?",
    options: [
      "Porque los hooks tienen peor rendimiento para el manejo de errores",
      "Porque React no expone un hook equivalente a getDerivedStateFromError ni a componentDidCatch",
      "Porque los componentes funcionales no pueden tener estado",
      "Por compatibilidad con versiones antiguas de React",
    ],
    correctIndex: 1,
    explanation:
      "React no ofrece un equivalente funcional nativo para getDerivedStateFromError ni componentDidCatch. Hay propuestas abiertas para un hook use(ErrorBoundary) pero a día de hoy no existe en React estable. Librerías como react-error-boundary abstraen la clase para que puedas usarla de forma declarativa desde componentes funcionales.",
  },
  {
    id: "eb-4",
    question: "¿Cuál de los siguientes errores NO captura un Error Boundary?",
    options: [
      "Un error en el render de un componente hijo",
      "Un error en el constructor de un componente hijo",
      "Un error dentro de un setTimeout en un event handler",
      "Un error en un método de ciclo de vida de un componente hijo",
    ],
    correctIndex: 2,
    explanation:
      "Los Error Boundaries solo capturan errores que ocurren dentro del ciclo de render de React. Un setTimeout se ejecuta fuera de ese ciclo, así que su error escapa al Error Boundary. Lo mismo aplica a fetch, promesas no capturadas y cualquier código asíncrono. Para esos casos necesitas try/catch o .catch().",
  },
  {
    id: "eb-5",
    question: "¿Cómo se implementa correctamente un botón de 'Reintentar' en un Error Boundary?",
    options: [
      "Llamando a this.forceUpdate() para forzar un re-render",
      "Llamando a this.setState({ hasError: false, error: null }) para limpiar el estado",
      "Desmontando y volviendo a montar el componente desde el padre con una key",
      "Usando el método reset() que React expone en el objeto error",
    ],
    correctIndex: 1,
    explanation:
      "Resetear hasError a false limpia el estado del boundary y React vuelve a renderizar los hijos. Sin embargo, si la condición que causó el error persiste (el mismo prop sigue siendo inválido, el mismo fetch sigue fallando), el Error Boundary volverá a capturar el error inmediatamente. Por eso el botón de reintentar suele combinarse con algún mecanismo en el padre para limpiar la causa raíz.",
  },
  {
    id: "eb-6",
    question: "¿Qué pasa si un Error Boundary lanza un error en su propio método render?",
    options: [
      "React muestra un fallback genérico de emergencia",
      "El error es ignorado y se muestra el último render válido",
      "Lo captura el Error Boundary padre más cercano en el árbol",
      "La aplicación entera se desmonta sin posibilidad de recuperación",
    ],
    correctIndex: 2,
    explanation:
      "Un Error Boundary no puede capturarse a sí mismo. Si su render falla, el error se propaga hacia arriba hasta el siguiente Error Boundary en el árbol. Por eso se recomienda colocar múltiples Error Boundaries en distintos niveles: uno en la raíz como red de seguridad global y otros más específicos alrededor de widgets o rutas individuales.",
  },
  {
    id: "eb-7",
    question:
      "¿Cuál es la diferencia entre getDerivedStateFromError y componentDidCatch en cuanto a cuándo se ejecutan?",
    options: [
      "Ambos se ejecutan en la fase de render, antes de que el DOM se actualice",
      "getDerivedStateFromError en la fase de render; componentDidCatch en la fase de commit",
      "getDerivedStateFromError en la fase de commit; componentDidCatch en la fase de render",
      "Ambos se ejecutan en la fase de commit, después de actualizar el DOM",
    ],
    correctIndex: 1,
    explanation:
      "getDerivedStateFromError se llama durante la fase de render — React lo necesita para saber qué mostrar. Por eso debe ser puro, sin side effects. componentDidCatch se llama en la fase de commit, una vez que el DOM ya está actualizado con el fallback. Esta separación es la que permite registrar el error (commit) sin bloquear el render del fallback.",
  },
  {
    id: "eb-8",
    question: "¿Qué contiene el segundo argumento que recibe componentDidCatch?",
    options: [
      "El estado anterior del componente antes del error",
      "Un objeto ErrorInfo con la propiedad componentStack",
      "La lista de todos los componentes afectados por el error",
      "Un objeto con métodos reset() y retry() para controlar la recuperación",
    ],
    correctIndex: 1,
    explanation:
      "El segundo argumento es un objeto ErrorInfo que contiene componentStack: una cadena con la traza del árbol de componentes hasta el que lanzó el error. Es muy útil para depuración y para enriquecer los reportes enviados a servicios de monitoreo como Sentry, que pueden mostrar esa traza junto al error.",
  },
  {
    id: "eb-9",
    question:
      "¿Por qué en desarrollo con StrictMode el Error Boundary parece no funcionar correctamente?",
    options: [
      "StrictMode deshabilita los Error Boundaries para forzar el uso de try/catch",
      "React vuelve a lanzar el error intencionalmente tras capturarlo para detectar efectos secundarios no seguros",
      "StrictMode usa un algoritmo de reconciliación diferente que ignora los boundaries",
      "Es un bug conocido de React que solo afecta al modo desarrollo",
    ],
    correctIndex: 1,
    explanation:
      "En desarrollo, React re-lanza el error después de que el Error Boundary lo captura. Esto hace que el error aparezca en la consola y en los overlays de herramientas como Create React App aunque el boundary esté funcionando. En producción el comportamiento es el esperado: el error queda capturado y se muestra el fallback sin ruido adicional.",
  },
  {
    id: "eb-10",
    question:
      "¿Qué librería popular abstrae los Error Boundaries para usarlos de forma declarativa en componentes funcionales?",
    options: [
      "react-query",
      "react-error-boundary",
      "react-suspense-boundary",
      "react-safe-render",
    ],
    correctIndex: 1,
    explanation:
      "react-error-boundary de Brian Vaughn (ahora mantenida por la comunidad) expone un componente <ErrorBoundary> con props como fallback, fallbackRender y onError, y un hook useErrorBoundary para lanzar errores manualmente desde componentes funcionales. Es la solución más adoptada cuando no quieres escribir una clase manualmente.",
  },
]

const typescriptReactQuestions: QuizQuestion[] = [
  {
    id: "ts-1",
    question: "¿Cuál es la forma correcta de tipar las props de un componente en TypeScript?",
    options: [
      "Usando PropTypes importado de 'prop-types'",
      "Definiendo una interface o type antes del componente y usándola como tipo del parámetro",
      "Agregando tipos directamente en JSX con as: <div as={string}>",
      "TypeScript infiere las props automáticamente, no se necesita tipado explícito",
    ],
    correctIndex: 1,
    explanation:
      "La forma idiomática en TypeScript es definir una interface (para shapes de objeto) o type (para uniones) y usarla como el tipo del parámetro props. Ejemplo: interface ButtonProps { label: string } — function Button({ label }: ButtonProps). PropTypes es la alternativa en JavaScript puro, no en TypeScript.",
  },
  {
    id: "ts-2",
    question: "¿Cuál es el tipo correcto para un evento onChange de un <input> en React con TypeScript?",
    options: [
      "React.ChangeEvent<HTMLInputElement>",
      "Event<HTMLInputElement>",
      "InputEvent",
      "React.SyntheticEvent",
    ],
    correctIndex: 0,
    explanation:
      "React envuelve los eventos nativos en SyntheticEvent. Para un input, el tipo correcto es React.ChangeEvent<HTMLInputElement>. El genérico <HTMLInputElement> da acceso a e.target.value con tipado seguro. React.SyntheticEvent es la base no tipada — demasiado genérica para leer target.value sin cast.",
  },
  {
    id: "ts-3",
    question: "¿Cómo se tipa un useRef que apuntará a un elemento <input> del DOM?",
    options: [
      "useRef<Element>(null)",
      "useRef<HTMLInputElement>(null)",
      "useRef(HTMLInputElement)",
      "useRef<Input>(undefined)",
    ],
    correctIndex: 1,
    explanation:
      "useRef<HTMLInputElement>(null) crea una ref tipada cuyo .current puede ser HTMLInputElement | null. El genérico debe ser el tipo exacto del elemento DOM (HTMLInputElement, HTMLDivElement, etc.). Inicializar con null es necesario porque antes de que el componente monte, ref.current es null.",
  },
  {
    id: "ts-4",
    question: "¿Qué ventaja tienen las Discriminated Unions para tipar props en React?",
    options: [
      "Permiten que TypeScript infiera automáticamente las props sin declarar la interfaz",
      "Permiten que ciertas props solo existan (o sean requeridas) según el valor de otra prop discriminante",
      "Son más rápidas en runtime que las interfaces normales",
      "Eliminan la necesidad de usar generics en los componentes",
    ],
    correctIndex: 1,
    explanation:
      "Con una discriminated union puedes modelar componentes que tienen formas distintas: type Props = { kind: 'link'; href: string } | { kind: 'button'; onClick: () => void }. TypeScript narrowing garantiza que si kind === 'link', href existe y onClick no está disponible. Es ideal para componentes polimórficos.",
  },
  {
    id: "ts-5",
    question: "¿Cuál es la diferencia entre React.FC<Props> y declarar la función directamente con su tipo de retorno?",
    options: [
      "No hay diferencia, son equivalentes en TypeScript moderno",
      "React.FC agrega children implícitamente y tiene algunas restricciones que la firma directa no tiene",
      "La firma directa no admite generics; React.FC sí",
      "React.FC es solo para componentes de clase; la firma directa para funcionales",
    ],
    correctIndex: 1,
    explanation:
      "React.FC (alias de React.FunctionComponent) fue popular pero hoy se desaconseja: agregaba children implícitamente en versiones antiguas, no funciona bien con generics en el componente, y restringe el tipo de retorno. La recomendación actual es function Button({ label }: ButtonProps): JSX.Element (o ReactElement/ReactNode según el caso).",
  },
  {
    id: "ts-6",
    question: "¿Cómo se crea un Context tipado correctamente para evitar el uso de 'as' y null checks en cada consumidor?",
    options: [
      "createContext<MyContextValue | null>(null) y lanzar error en el hook si el valor es null",
      "createContext<MyContextValue>({} as MyContextValue)",
      "createContext(undefined) y hacer cast con as MyContextValue en useContext",
      "No se puede tipar Context sin usar any",
    ],
    correctIndex: 0,
    explanation:
      "El patrón correcto es createContext<MyContextValue | null>(null) con un hook personalizado que valida: const ctx = useContext(MyCtx); if (!ctx) throw new Error('Fuera del Provider'); return ctx. Así el hook retorna MyContextValue (sin null) y los consumidores quedan seguros sin casts. Usar {} as MyContextValue es un anti-patrón que oculta errores.",
  },
  {
    id: "ts-7",
    question: "¿Cómo se tipa correctamente un componente genérico en React con TypeScript?",
    options: [
      "No es posible, los componentes React no admiten generics",
      "function List<T>(props: { items: T[]; renderItem: (item: T) => ReactNode }): ReactElement",
      "function List(props: { items: any[]; renderItem: Function }): ReactElement",
      "Los generics solo funcionan con React.FC, no con funciones normales",
    ],
    correctIndex: 1,
    explanation:
      "Los componentes genéricos son totalmente válidos: function List<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => ReactNode }) { ... }. TypeScript infiere T al llamar <List items={users} renderItem={(u) => u.name} /> sin necesidad de pasarlo explícitamente. Es el patrón para componentes reutilizables como Table, Select o Combobox.",
  },
  {
    id: "ts-8",
    question: "¿Qué hace el operador 'satisfies' de TypeScript y cuándo es útil con objetos de configuración en React?",
    options: [
      "Es un alias de 'as', realiza un type cast sin validación",
      "Valida que un valor cumple un tipo sin cambiar el tipo inferido del valor",
      "Convierte un tipo union en un tipo intersection",
      "Solo funciona con tipos primitivos, no con objetos",
    ],
    correctIndex: 1,
    explanation:
      "satisfies valida sin ampliar el tipo. Con const routes = { home: '/', about: '/about' } satisfies Record<string, string>, TypeScript verifica que los valores son strings pero infiere routes.home como el literal '/' — no como string genérico. Útil para objetos de configuración, paletas de colores o mapas de rutas donde quieres autocompletado preciso.",
  },
  {
    id: "ts-9",
    question: "¿Cómo se extienden las props HTML nativas de un elemento en un componente wrapper?",
    options: [
      "Importando HTMLAttributes<HTMLButtonElement> y usando extends o & en la interfaz de props",
      "Usando PropTypes.element para heredar los tipos del DOM",
      "Pasando ...rest sin tipar, TypeScript lo infiere automáticamente",
      "No es posible mezclar props custom con props HTML nativas",
    ],
    correctIndex: 0,
    explanation:
      "interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'ghost' }. Así el componente acepta todas las props nativas del botón (disabled, onClick, type, aria-*, etc.) más las propias. El spread {...rest} pasa las nativas al elemento DOM y TypeScript valida que solo lleguen atributos válidos.",
  },
  {
    id: "ts-10",
    question: "¿Cuál es la forma correcta de tipar un custom hook que devuelve múltiples valores?",
    options: [
      "Siempre retornar un objeto { value, setValue } — las tuplas no son idiomáticas en TypeScript",
      "Retornar un array y usar 'as const' para que TypeScript infiera una tupla en lugar de un array",
      "Usar any[] como tipo de retorno para máxima flexibilidad",
      "TypeScript infiere las tuplas automáticamente sin necesidad de 'as const'",
    ],
    correctIndex: 1,
    explanation:
      "Sin as const, TypeScript infiere el retorno como (string | Dispatch<...>)[] — un array de unión, no una tupla. Con return [value, setValue] as const, TypeScript infiere [string, Dispatch<SetStateAction<string>>] preservando la posición y el tipo exacto de cada elemento. Así el consumidor obtiene tipado correcto al desestructurar const [val, setVal] = useMyHook().",
  },
]

export const allQuizzes: Quiz[] = [
  {
    id: "fundamentos",
    label: "Fundamentos",
    description: "State, props, Virtual DOM y las bases de React",
    difficulty: "basic",
    questions: fundamentosQuestions,
  },
  {
    id: "listas-y-keys",
    label: "Listas y keys",
    description: "Renderizado de listas, prop key, renderizado condicional y Fragments",
    difficulty: "basic",
    questions: listasYKeysQuestions,
  },
  {
    id: "formularios",
    label: "Formularios",
    description: "Inputs controlados, eventos de formulario y manejo del submit",
    difficulty: "basic",
    questions: formulariosQuestions,
  },
  {
    id: "efectos-basicos",
    label: "Efectos",
    description: "useEffect: cuándo corre, cleanup, dependencias y errores comunes",
    difficulty: "basic",
    questions: efectosBasicosQuestions,
  },
  {
    id: "estado-basico",
    label: "Estado",
    description: "useState: actualizaciones, inmutabilidad, batching y estado derivado",
    difficulty: "basic",
    questions: estadoBasicoQuestions,
  },
  {
    id: "hooks",
    label: "Hooks",
    description: "useEffect, useMemo, useCallback y el modelo mental correcto",
    difficulty: "intermediate",
    questions: hooksQuestions,
  },
  {
    id: "patrones",
    label: "Patrones",
    description: "HOC, Render Props, Controlled components y composición",
    difficulty: "intermediate",
    questions: patronesQuestions,
  },
  {
    id: "rendimiento",
    label: "Rendimiento",
    description: "Memoización, code splitting, batching y optimización de renders",
    difficulty: "intermediate",
    questions: rendimientoQuestions,
  },
  {
    id: "contexto",
    label: "Context API",
    description: "createContext, Provider, useContext y patrones para evitar re-renders",
    difficulty: "intermediate",
    questions: contextoQuestions,
  },
  {
    id: "avanzado",
    label: "Avanzado",
    description: "Concurrent React, Server Components, React 19 y arquitectura profunda",
    difficulty: "advanced",
    questions: avanzadoQuestions,
  },
  {
    id: "compound-components",
    label: "Compound Components",
    description: "Patrón Compound Components: Context privado, subcomponentes y APIs flexibles",
    difficulty: "advanced",
    questions: compoundComponentsQuestions,
  },
  {
    id: "error-boundary",
    label: "Error Boundary",
    description:
      "Captura de errores en React: getDerivedStateFromError, componentDidCatch y estrategias de recuperación",
    difficulty: "advanced",
    questions: errorBoundaryQuestions,
  },
  {
    id: "typescript-react",
    label: "TypeScript + React",
    description:
      "Tipado de props, eventos, refs, generics, discriminated unions y patrones avanzados de TypeScript con React",
    difficulty: "advanced",
    questions: typescriptReactQuestions,
  },
]

export const quizIndex: Record<string, Quiz> = Object.fromEntries(allQuizzes.map((q) => [q.id, q]))
