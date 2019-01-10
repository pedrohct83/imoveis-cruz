var Realty = require("./models/realty"),
    Tenant = require("./models/tenant");

var realtySeeds = [
    {
        name: "Ilha Santa Cruz",
        type: "Ilha",
        owner: "Cruz",
        location: "50% Ilha Dr. Cruz (Santa Cruz ou Gaspar)",
        mapIframe: "<iframe src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59879.01656348805!2d-40.320723226983944!3d-20.28210755987133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xb83d5d85374ee9%3A0x97595e7ea70ed809!2zVml0w7NyaWEsIEVT!5e0!3m2!1spt-BR!2sbr!4v1544670045515' width='600' height='450' frameborder='0' style='border:0' allowfullscreen></iframe>",
        areaSize: 242275.10,
        fiscalNum: 17042940,
        isRented: "Sim",
        tenant:{
            id : "588c2e092403d111454fff76",
            name: "João da Silva Teixeira de Melo"
        },
        contractStart: new Date("November 29, 2018"),
        contractEnd: new Date("November 29, 2019"),
        rentValue: 125.43,
        condominiumValue: 5005.00,
        notes: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
        name: "Armazém Av. Mar. Mascarenhas",
        type: "Armazém",
        owner: "MPN",
        location: "Av. Mar. Mascarenhas de Moraes, 1717",
        mapIframe: "<iframe src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59879.01656348805!2d-40.320723226983944!3d-20.28210755987133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xb83d5d85374ee9%3A0x97595e7ea70ed809!2zVml0w7NyaWEsIEVT!5e0!3m2!1spt-BR!2sbr!4v1544670045515' width='600' height='450' frameborder='0' style='border:0' allowfullscreen></iframe>",
        areaSize: 843.44,
        fiscalNum: 3264378,
        isRented: "Sim",
        tenant:{
            id : "588c2e092403d111454fff76",
            name: "Renato José Pereira Neto"
        },
        contractStart: new Date("November 29, 2018"),
        contractEnd: new Date("November 29, 2019"),
        rentValue: 12300.04,
        condominiumValue: 2500.12,
        notes: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }
];

var tenantSeeds = [
    {
        name: "Pedro Henrique da Cruz Torres",
        type: "Pessoa Física",
        idNum: 09630832798,
        contactName: "Pedro",
        contactNum: 27981286558, 
        createdAt: { type: Date, default: Date.now },
        notes: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
        name: "Maira Rocha Moreira da Cruz",
        type: "Pessoa Física",
        idNum: 09630832798,
        contactName: "Maira",
        contactNum: 27987848375, 
        createdAt: { type: Date, default: Date.now },
        notes: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }
]

async function seedDB(){
    try {
        await Realty.deleteMany();
        await Tenant.deleteMany();
        console.log('Realty and tenants removed');
        // for(let seed of realtySeeds) {
        //     let realty = await Realty.create(seed);
        //     console.log(`Realty created: ${realty.name}`);
        //     realty.save();
        // }
        // for(let seed of tenantSeeds) {
        //     let tenant = await Tenant.create(seed);
        //     console.log(`Tenant created: ${tenant.name}`);
        //     tenant.save();
        // }
    } catch(err) {
        console.log(err);
    }
}

module.exports = seedDB;