const DATA_URL = `/site-data`
const STAGING_DATA_URL = `https://staging.virustrack.live/site-data`
const TEST_DATA_URL = `https://test.virustrack.live/site-data`
const LOCAL_DATA_URL = `http://localhost:3100/site-data`

const GEO_URL = `https://virustrack.live/country_info`
const STAGING_GEO_URL = `https://staging.virustrack.live/country_info`
const TEST_GEO_URL = `https://test.virustrack.live/country_info`
const LOCAL_GEO_URL = `http://localhost_3100/country_info`

const LAST_UPDATE_KEY = 'covid-lastUpdated'

const CLIENT_COUNTRY_KEY = 'covid-clientCountry'
const CLIENT_COUNTRY_CODE_KEY = 'covid-clientCountryCode'

const ONE_MINUTE = 1 * 60 * 1000
const CACHE_TIMER = ONE_MINUTE

const GOOGLE_ANALYTICS_KEY = 'UA-574325-5'

const DEFAULT_DOCUMENT_TITLE = "COVID-19 Novel Coronavirus Data Visualization and Statistics"

const ENABLE_PREDICTIONS = true

const COUNTRIES = [
  "!Global",
  "!Outside Mainland China",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Côte d'Ivoire",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Holy See",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine State",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "UK",
  "US",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
]

  const US_REGIONS = [
    "!Total US",
    "Diamond Princess",
    "Midwest",
    "Northeast",
    "South",
    "Unassigned",
    "West"
  ]

  const US_STATES = [
  "!Total US",  
  "Alabama",
  "Alaska",
  "American Samoa",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Washington D.C.",
  "Florida",
  "Georgia",
  "Guam",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Marshall Islands",
  "Massachusetts",
  "Michigan",
  "Micronesia",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Northern Marianas",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Palau",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Virgin Islands",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"]

  const US_STATES_WITH_ABBREVIATION = {
      "Alabama": 'AL',
      "Alaska": 'AK',
      "Arizona": 'AZ',
      "Arkansas": 'AR',
      "California": 'CA',
      "Colorado": 'CO',
      "Connecticut": 'CT',
      "Delaware": 'DE',
      "Washington D.C.": 'DC',
      "Florida": 'FL',
      "Georgia": 'GA',
      "Hawaii": 'HI',
      "Idaho": 'ID',
      "Illinois": 'IL',
      "Indiana": 'IN',
      "Iowa": 'IA',
      "Kansas": 'KA',
      "Kentucky": 'KY',
      "Louisiana": 'LA',
      "Maine": 'ME',
      "Maryland": 'MD',
      "Massachusetts": 'MA',
      "Michigan": 'MI',
      "Minnesota": 'MN',
      "Mississippi": 'MS',
      "Missouri": 'MO',
      "Montana": 'MT',
      "Nebraska": 'NB',
      "Nevada": 'NV',
      "New Hampshire": 'NH',
      "New Jersey": 'NJ',
      "New Mexico": 'NM',
      "New York": 'NY',
      "North Carolina": 'NC',
      "North Dakota": 'ND',
      "Ohio": 'OH',
      "Oklahoma": 'OK',
      "Oregon": 'OR',
      "Pennsylvania": 'PA',
      "Rhode Island": 'RI',
      "South Carolina": 'SC',
      "South Dakota": 'SD',
      "Tennessee": 'TN',
      "Texas": 'TX',
      "Utah": 'UT',
      "Vermont": 'VT',
      "Virginia": 'VA',
      "Washington": 'WA',
      "West Virginia": 'WV',
      "Wisconsin": 'WI',
      "Wyoming": 'WY'
  }

  const REGION_URLS = {
    "!Total US": "https://www.cdc.gov/coronavirus/2019-ncov/index.html",
    "Washington": "https://www.doh.wa.gov/Emergencies/Coronavirus",
    "New York": "https://coronavirus.health.ny.gov/home",
    "California": "https://www.cdph.ca.gov/Programs/CID/DCDC/Pages/Immunization/nCOV2019.aspx",
    "Massachusetts": "https://www.mass.gov/info-details/covid-19-cases-quarantine-and-monitoring",
    "Diamond Princess": "https://www.cdc.gov/media/releases/2020/s0215-Diamond-Princess-Repatriation.html",
    "New Jersey": "https://www.nj.gov/health/cd/topics/ncov.shtml",
    "Georgia": "https://dph.georgia.gov/novelcoronavirus",
    "Florida": "http://www.floridahealth.gov/diseases-and-conditions/COVID-19/",
    "Illinois": "http://dph.illinois.gov/topics-services/diseases-and-conditions/diseases-a-z-list/coronavirus",
    "Oregon": "https://www.oregon.gov/oha/PH/DISEASESCONDITIONS/DISEASESAZ/Pages/emerging-respiratory-infections.aspx",
    "Iowa": "https://idph.iowa.gov/Emerging-Health-Issues/Novel-Coronavirus",
    "Pennsylvania": "https://www.health.pa.gov/topics/disease/Pages/Coronavirus.aspx",
    "Arizona": "https://www.azdhs.gov/preparedness/epidemiology-disease-control/infectious-disease-epidemiology/index.php#novel-coronavirus-home",
    "South Carolina": "https://scdhec.gov/health/infectious-diseases/viruses/coronavirus-disease-2019-covid-19",
    "Colorado": "https://www.colorado.gov/pacific/cdphe/2019-novel-coronavirus",
    "Kentucky": "https://healthalerts.ky.gov/Pages/Coronavirus.aspx",
    "Texas": "https://dshs.texas.gov/coronavirus/",
    "Maryland": "https://phpa.health.maryland.gov/Pages/Novel-coronavirus.aspx",
    "Wisconsin": "https://www.dhs.wisconsin.gov/disease/coronavirus.htm",
    "South Dakota": "https://doh.sd.gov/news/Coronavirus.aspx",
    "Virginia": "www.vdh.virginia.gov/surveillance-and-investigation/novel-coronavirus/",
    "Nevada": "http://dpbh.nv.gov/coronavirus/",
    "New Hampshire": "https://www.dhhs.nh.gov/dphs/cdcs/2019-ncov.htm",
    "Minnesota": "https://www.health.state.mn.us/diseases/coronavirus/basics.html",
    "Ohio": "https://odh.ohio.gov/wps/portal/gov/odh/know-our-programs/Novel-Coronavirus/welcome/",
    "Rhode Island": "https://health.ri.gov/diseases/ncov2019/",
    "Tennessee": "https://www.tn.gov/health/cedep/ncov.html",
    "Connecticut": "https://portal.ct.gov/Coronavirus",
    "Hawaii": "https://health.hawaii.gov/docd/advisories/novel-coronavirus-2019/",
    "Indiana": "https://www.in.gov/isdh/28470.htm",
    "Michigan": "https://www.michigan.gov/coronavirus/",
    "North Carolina": "https://www.ncdhhs.gov/divisions/public-health/coronavirus-disease-2019-covid-19-response-north-carolina",
    "Kansas": "http://www.kdheks.gov/coronavirus/",
    "Louisiana": "http://ldh.la.gov/Coronavirus/",
    "Mississippi": "https://msdh.ms.gov/msdhsite/_static/14,0,420.html",
    "Missouri": "https://health.mo.gov/living/healthcondiseases/communicable/novel-coronavirus/",
    "Nebraska": "http://dhhs.ne.gov/Pages/Coronavirus.aspx",
    "Oklahoma": "https://www.ok.gov/health/Prevention_and_Preparedness/Acute_Disease_Service/Disease_Information/2019_Novel_Coronavirus/index.html",
    "Utah": "https://coronavirus.utah.gov/",
    "Vermont": "https://www.healthvermont.gov/response/infectious-disease/2019-novel-coronavirus",
    "Washington D.C.": "https://coronavirus.dc.gov/",
    "Alabama": "https://www.alabamapublichealth.gov/infectiousdiseases/2019-coronavirus.html",
    "Alaska": "http://www.dhss.alaska.gov/dph/Epi/id/Pages/COVID-19/default.aspx",
    "Arkansas": "https://www.healthy.arkansas.gov/programs-services/topics/novel-coronavirus",
    "Delaware": "https://dhss.delaware.gov/dhss/dph/epi/2019novelcoronavirus.html",
    "Guam": "https://ghs.guam.gov/coronavirus-covid-19",
    "Idaho": "https://www.cdhd.idaho.gov/dac-coronavirus.php",
    "Maine": "https://www.maine.gov/dhhs/mecdc/infectious-disease/epi/airborne/coronavirus.shtml",
    "Montana": "https://dphhs.mt.gov/publichealth/cdepi/diseases/coronavirusmt",
    "New Mexico": "http://cv.nmhealth.org/",
    "North Dakota": "https://www.health.nd.gov/diseases-conditions/coronavirus",
    "Palau": "https://pw.usembassy.gov/coronavirus-update-palau/",
    "Virgin Islands": "https://doh.vi.gov/news/department-health-closely-monitoring-coronavirus",
    "Wyoming": "https://health.wyo.gov/publichealth/infectious-disease-epidemiology-unit/disease/novel-coronavirus/",

// Countries
    "!Global": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public",
    "US": "https://www.cdc.gov/coronavirus/2019-ncov/index.html",
    "Italy": "http://www.salute.gov.it/nuovocoronavirus",
    "Spain": "https://www.mscbs.gob.es/profesionales/saludPublica/ccayes/alertasActual/nCov-China/home.htm",
    "China": "https://en.wikipedia.org/wiki/National_Health_Commission",
    "Germany": "https://www.infektionsschutz.de/coronavirus-sars-cov-2.html",
    "France": "https://www.gouvernement.fr/info-coronavirus",
    "Iran": "http://mohme.gov.ir/",
    "United Kingdom": "https://www.gov.uk/coronavirus",
    "Switzerland": "https://www.bag.admin.ch/bag/en/home/krankheiten/ausbrueche-epidemien-pandemien/aktuelle-ausbrueche-epidemien/novel-cov.html",
    "Belgium": "https://www.info-coronavirus.be/en/",
    "Netherlands": "https://www.rijksoverheid.nl/onderwerpen/coronavirus-covid-19",
    "Turkey": "https://covid19.saglik.gov.tr/tr/",
    "Austria": "https://www.sozialministerium.at/",
    "Korea, South": "https://www.mohw.go.kr/eng/",
    "Canada": "https://www.canada.ca/en/public-health/services/diseases/coronavirus-disease-covid-19.html",
    "Portugal": "https://covid19.min-saude.pt/",
    "Israel": "https://info.oref.org.il/",
    "Brazil": "https://www.saude.gov.br/saude-de-a-z/coronavirus",
    "Norway": "https://helsenorge.no/koronavirus",
    "Australia": "https://www.australia.gov.au/",
    "Sweden": "https://www.folkhalsomyndigheten.se/covid-19",
    "Czechia": "https://koronavirus.mzcr.cz/",
    "Denmark": "https://www.sst.dk/corona-eng",
    "Ireland": "https://www2.hse.ie/conditions/coronavirus/coronavirus.html",
    "Malaysia": "http://www.moh.gov.my/index.php/pages/view/2019-ncov-wuhan",
    "Chile": "https://www.gob.cl/coronavirus",
    "Russia": "https://www.rosminzdrav.ru/ministry/covid19",
    "Romania": "http://www.dsu.mai.gov.ro/",
    "Poland": "https://www.gov.pl/web/koronawirus",
    "Japan": "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/newpage_00032.html",
    "Philippines": "https://www.doh.gov.ph/2019-nCoV",
    "Luxembourg": "https://msan.gouvernement.lu/en/dossiers/2020/corona-virus.html",
    "Ecuador": "https://coronavirusecuador.com/",
    "Pakistan": "https://webcache.googleusercontent.com/search?q=cache:hlYJ4CrPbsEJ:https://www.nih.org.pk/novel-coranavirus-2019-ncov/",
    "Thailand": "https://www.thailandmedical.news/articles/coronavirus",
    "Saudi Arabia": "https://www.moh.gov.sa/Pages/Default.aspx",
    "Indonesia": "https://www.covid19.go.id/",
    "Finland": "https://thl.fi/fi/web/infektiotaudit-ja-rokotukset/ajankohtaista/ajankohtaista-koronaviruksesta-covid-19",
    "South Africa": "https://sacoronavirus.co.za/",
    "India": "https://www.mohfw.gov.in/",
    "Greece": "https://eody.gov.gr/neos-koronaios-covid-19/",
    "Mexico": "https://www.gob.mx/salud/documentos/nuevo-coronavirus",
    "Iceland": "https://www.covid.is/english",
    "Panama": "https://yomeinformopma.org/",
    "Argentina": "https://www.argentina.gob.ar/salud/coronavirus-COVID-19",
    "Peru": "https://www.gob.pe/minsa/",
    "Singapore": "https://www.moh.gov.sg/covid-19",
    "Dominican Republic": "https://www.msp.gob.do/web/",
    "Croatia": "https://eunethta.eu/miz/",
    "Slovenia": "https://www.gov.si/teme/koronavirus/",
    "Colombia": "https://www.minsalud.gov.co/English/Paginas/inicio.aspx",
    "Serbia": "https://covid19.rs/",
    "Estonia": "https://www.terviseamet.ee/en/covid19",
    "Hong Kong": "https://www.chp.gov.hk/en/index.html",
    "Qatar": "https://www.moph.gov.qa/english/Pages/Coronavirus2019.aspx",
    "Egypt": "http://www.mohp.gov.eg/",
    "New Zealand": "https://covid19.govt.nz/",
    "Iraq": "https://moh.gov.iq/",
    "United Arab Emirates": "https://www.emirates.com/us/english/help/covid-19/",
    "Algeria": "http://www.sante.gov.dz/",
    "Morocco": "https://www.sante.gov.ma/Pages/Accueil.aspx",
    "Ukraine": "https://moz.gov.ua/koronavirus-2019-ncov",
    "Lithuania": "http://lrv.lt/en/relevant-information/coronavirus-in-lithuania/latest-information",
    "Bahrain": "https://www.moh.gov.bh/",
    "Hungary": "https://koronavirus.gov.hu/",
    "Armenia": "https://ncdc.am/coronavirus/?fbclid=IwAR2l1VqAccEzSQ94oirzdS5AhqaiZRoUy9-Ux8VKVqNvRZWl_UiV2Oycqss",
    "Lebanon": "https://www.moph.gov.lb/",
    "Bosnia and Herzegovina": "http://www.fbihvlada.gov.ba/english/ministarstva/zdravstvo.php",
    "Latvia": "https://spkc.gov.lv/en/news/get/nid/530",
    "Bulgaria": "http://www.mh.government.bg/bg/",
    "Andorra": "https://www.govern.ad/ministeri-de-salut",
    "Slovakia": "https://www.health.gov.sk/Titulka",
    "Tunisia": "http://www.santetunisie.rns.tn/fr/",
    "Kazakhstan": "https://www.gov.kz/memleket/entities/dsm?lang=kk",
    "Costa Rica": "https://www.ministeriodesalud.go.cr/index.php/centro-de-prensa/noticias/741-noticias-2020/1532-lineamientos-nacionales-para-la-vigilancia-de-la-infeccion-por-coronavirus-2019-ncov",
    "Uruguay": "https://www.gub.uy/ministerio-salud-publica/coronavirus",
    "Taiwan*": "https://www.cdc.gov.tw/En",
    "Moldova": "https://msmps.gov.md/ro/content/ce-este-un-coronavirus-de-tip-nou-cum-sa-te-protejezi-impotriva-acestei-infectii-intrebari",
    "Azerbaijan": "http://www.health.gov.az/",
    "Jordan": "https://www.moh.gov.jo/",
    "Kuwait": "https://www.moh.gov.kw/en/Pages/default.aspx",
    "Burkina Faso": "https://www.sante.gov.bf/accueil",
    "Albania": "https://shendetesia.gov.al/",
    "Cyprus": "https://www.moh.gov.cy/moh/moh.nsf/index_en/index_en?OpenDocument",
    "San Marino": "http://www.sanita.sm/on-line/home.html",
    "Vietnam": "https://moh.gov.vn/",
    "Oman": "https://www.moh.gov.om/ar/1",
    "Senegal": "http://www.sante.gouv.sn/",
    "Cuba": "http://www.sld.cu/",
    "Malta": "https://deputyprimeminister.gov.mt/en/Pages/health.aspx",
    "Cote d'Ivoire": "http://www.sante.gouv.ci/",
    "Uzbekistan": "http://www.minzdrav.uz/",
    "Belarus": "http://minzdrav.gov.by/",
    "Ghana": "https://ghanahealthservice.org/covid19/",
    "Afghanistan": "https://moph.gov.af/",
    "Mauritius": "http://health.govmu.org/English/Pages/default.aspx",
    "Sri Lanka": "http://www.epid.gov.lk/web/index.php?option=com_content&view=article&id=228&lang=en",
    "Cameroon": "https://www.minsante.cm/",
    "Honduras": "http://www.salud.gob.hn/site/",
    "Nigeria": "https://covid19.ncdc.gov.ng/",
    "Brunei": "https://www.healthinfo.gov.bn/covid19/#/home",
    "Venezuela": "http://www.mpps.gob.ve/",
    "Palestine": "https://www.moh.gov.ps/portal/",
    "Cambodia": "http://moh.gov.kh/",
    "Bolivia": "https://www.minsalud.gob.bo/",
    "DR Congo": "http://www.minisanterdc.cd/",
    "Kyrgyzstan": "http://www.med.kg/ru/",
    "Montenegro": "http://www.mzd.gov.me/ministarstvo",
    "Trinidad and Tobago": "http://www.health.gov.tt/",
    "Rwanda": "https://moh.gov.rw/index.php?id=188",
    "Paraguay": "https://www.mspbs.gov.py/index.php",
    "Kenya": "http://www.health.go.ke/",
    "Bangladesh": "http://www.mohfw.gov.bd/",
    "Madagascar": "http://www.sante.gov.mg/ministere-sante-publique/",
    "Monaco": "https://www.gouv.mc/Gouvernement-et-Institutions/Le-Gouvernement/Departement-des-Affaires-Sociales-et-de-la-Sante",
    "Uganda": "https://www.health.go.ug/",
    "Guatemala": "https://www.mspas.gob.gt/",
    "Jamaica": "https://www.moh.gov.jm/",
    "Togo": "https://sante.gouv.tg/",
    "Barbados": "http://www.health.gov.bb/",
    "Bermuda": "https://www.gov.bm/coronavirus",
    "El Salvador": "http://www.salud.gob.sv/",
    "Djibouti": "http://www.sante.gouv.dj/",
    "Mali": "http://www.sante.gov.ml/",
    "Ethiopia": "http://www.moh.gov.et/ejcc/",
    "Guinea": "https://sante.gov.gn/",
    "Tanzania": "https://www.moh.go.tz/en/",
    "Maldives": "http://www.health.gov.mv/",
    "Bahamas": "http://www.bahamas.gov.bs/wps/portal/public/!ut/p/b1/vdTLjqJAFAbgZ_EBpuvCfVkILSAgIKXCxnBpFRDwgoD19O1kZjOZdM9mQp1VJX_ynZOcKhCDHYibpC-OSVe0TXL-eY_FPQcXDiG87KxwqEATzZG4pAKUNRFswc6IWmHekkEn6iEaK1zfH9RsC3e7uJdVMSTDZgP3vGK42TA4jhkVuvIRZacKsTw8BKTM1mn45B9-r7D5D4Fjx5PRd67am5RGWQ2r5eOh28bg46I6HzQ1Obu3FSpvjUbT6CkikRCm1KMzezUbvZqFXxwC_z1L_GdkIUARmtSziScZeMXD34FviOgVkL5GJBCCHeT36_J5MVnFgpL50Ak3phtGDDE63Cu2dUOdc7sEhVqEYEoHh96hwxyuY4Eb5oaXbwKqEs3Tjs_H9-Da5qcF5VCcGuQmBjk4NYinBoWJQWvqLeX-_zu0QFyk9duQ1W_wTYAIYQ7JAuYkUcJgY2XHX3-krgV3dHJEOHZLvnCxHqXFOm5NtRtNz8Bpt9t7qs8b2XMkvr1c5XmdH-jWeFdHdFGI49P3yzyw-6u5wK3VSEHTpMO1JOptkdbnvcosr1IOctYq-Ca2qXWNd4zMZsA12voDXOreFgMZ_VXccfYJeW19nw!!/dl4/d5/L2dBISEvZ0FBIS9nQSEh/",
    "Myanmar": "https://mohs.gov.mm/Main/content/publication/2019-ncov",
    "Cayman Islands": "http://www.gov.ky/portal/page/portal/cighome/find/organisations/azagencies/mhs",
    "Dominica": "http://dominica.gov.dm/",
    "Guyana": "https://www.health.gov.gy/",
    "Mongolia": "http://www.mohs.mn/home",
    "Namibia": "http://www.mhss.gov.na/",
    "Seychelles": "http://www.gov.sc/GovernmentAgencies/Ministry/minhealth.aspx",
    "Syria": "http://www.moh.gov.sy/Default.aspx?tabid=56&language=ar-YE",
    "Laos": "https://www.moh.gov.la/index.php/lo-la/",
    "Saint Lucia": "http://health.govt.lc/",
    "Benin": "https://sante.gouv.bj/",
    "Mozambique": "http://www.misau.gov.mz/",
    "Angola": "http://www.minsa.gov.ao/",
    "Antigua and Barbuda": "https://ab.gov.ag/detail_page.php?page=29",
    "Gabon": "http://www.sante.gouv.ga/",
    "Zimbabwe": "http://www.mohcc.gov.zw/",
    "Sudan": "http://www.fmoh.gov.sd/",
    "Cape Verde": "http://www.minsaude.gov.cv/?oppphdjecbiecjek",
    "Chad": "https://sante-tchad.org/",
    "Mauritania": "http://www.sante.gov.mr/",
    "Nepal": "https://mohp.gov.np/en/",
    "Bhutan": "http://www.moh.gov.bt/",
    "Botswana": "https://www.moh.gov.bw/",
    "Gambia": "http://www.moh.gov.gm/",
    "Nicaragua": "http://www.minsa.gob.ni/",
    "Belize": "http://health.gov.bz/www/",
    "Liberia": "http://moh.gov.lr/",
    "Somalia": "http://moh.gov.so/en/",
    "Burundi": "http://www.fbpsanteburundi.bi/",
    "Papua New Guinea": "http://www.health.gov.pg/",
    "Sierra Leone": "https://www.facebook.com/Ministry-of-Health-and-Sanitation-Sierra-Leone-281064805403702/",

    }

  export { 
    GOOGLE_ANALYTICS_KEY,
    ENABLE_PREDICTIONS,
    DEFAULT_DOCUMENT_TITLE,
    COUNTRIES,
    US_REGIONS,
    US_STATES,
    US_STATES_WITH_ABBREVIATION,
    DATA_URL,
    STAGING_DATA_URL,
    LOCAL_DATA_URL,
    TEST_DATA_URL,
    GEO_URL,
    STAGING_GEO_URL,
    TEST_GEO_URL,    
    LOCAL_GEO_URL,
    REGION_URLS,
    CACHE_TIMER,
    ONE_MINUTE,
    LAST_UPDATE_KEY,
    CLIENT_COUNTRY_KEY,
    CLIENT_COUNTRY_CODE_KEY,
  }
