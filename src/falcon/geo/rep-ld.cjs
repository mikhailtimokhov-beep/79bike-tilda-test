// Вставляет статический JSON-LD (WebSite, Organization, FAQPage) в src/rep/index.html между маркерами <!--geo-ld--> … <!--/geo-ld-->.
const fs=require("fs"),p=process.argv[2];let h=fs.readFileSync(p,"utf8");
const i=h.indexOf("var FAQ = ["),j=h.indexOf("];",i);const FAQ=eval(h.slice(i+10,j+1));
const strip=s=>String(s).replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();
const R="https://79bike.ru";
const ld=[{"@context":"https://schema.org","@type":"WebSite","@id":R+"/#website","name":"79BIKE в России","url":R+"/","inLanguage":"ru-RU","publisher":{"@id":R+"/#org"}},
{"@context":"https://schema.org","@type":"Organization","@id":R+"/#org","name":"79BIKE в России","description":"Официальное представительство завода-производителя 79BIKE в России","url":R+"/","telephone":"+7 (999) 900-55-88","email":process.argv[3],"areaServed":{"@type":"Country","name":"Россия"},"brand":[{"@type":"Brand","name":"Falcon"},{"@type":"Brand","name":"Lynx"},{"@type":"Brand","name":"Y-Volt"}],"sameAs":["https://falcon-bike.ru/","https://vk.com/79bike","https://rutube.ru/channel/65461061/","https://t.me/club79bike"]},
{"@context":"https://schema.org","@type":"FAQPage","@id":R+"/#faq","mainEntity":FAQ.map(f=>({"@type":"Question","name":strip(f[0]),"acceptedAnswer":{"@type":"Answer","text":strip(f[1])}}))}];
const block="<!--geo-ld-->\n"+ld.map(x=>'<script type="application/ld+json">'+JSON.stringify(x)+"</script>").join("\n")+"\n<!--/geo-ld-->";
h=/<!--geo-ld-->[\s\S]*?<!--\/geo-ld-->/.test(h)?h.replace(/<!--geo-ld-->[\s\S]*?<!--\/geo-ld-->/,block):h.replace("</head>",block+"\n</head>");
fs.writeFileSync(p,h);console.log("faq",FAQ.length);
