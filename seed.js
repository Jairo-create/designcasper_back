
const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const products = [
  {
    
       name: "Chaquetas Estampadas",
       priceWholesale:15000,
       priceRetail: 70000,
       category: "rompevientos",
       gender: "unisex",
       sizes: ["XS", "S", "M", "L"],
       colors: ["red", "blue", "orange", "DarkKhaki"],
       imagesByColor: {
       red: [
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270519/krnv8krsouibatuyygvz.png",
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270518/c1vt6ecodwym7qaadxws.png",
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270371/uistzhaibvsejza23hsz.png"
        ],
       blue: [
           "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270537/yloxdgzx0fsjsccw7r4j.png",
           "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270511/lc5bbua4fl8cadgzetb0.png"
          
        ],
       orange: [
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270447/mmhjoplpmnfyiguqan50.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270449/ui9uuofedik1vtipe1sy.png",
           
        ],
        DarkKhaki: [
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270461/xccgbyewrs69uhlrqnpk.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270481/vj9d8gvwbsicikaipb7y.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270479/nn6befnwpa7wdl48dlkr.png"
           
        ]
      },
       isNewProduct: false,
       isPromo: false
      
    },


     {
       
       name: "Rompevientos Colombia",
       priceWholesale:15000,
       priceRetail: 70000,
       category: "rompevientos",
       gender: "unisex",
       sizes: ["XS", "S", "M", "L"],
       colors: ["yellow", "blue", "white", "red", "Gray"],
       imagesByColor: {
       yellow: [
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270499/ysgmw39zlau3zlegegj9.png",
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270455/icvitqjm9eukqxeuviv3.png",
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270453/ydjxinwktwmlqfijqlw7.png"
        ],
       blue: [
           "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270472/jyjkhcdvudb2cg6243n9.png",
           "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270385/a94cw5jj4ralzy3qid3i.png"
          
        ],
       white: [
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270488/tq9dgwo2ssigztmmutvu.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270473/scifvbo1ugwrtcuksc3k.png",
           
        ],
        red: [
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270530/l0zwqgnghbzpijfjkv6s.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270517/znvoyahwgcebte3qylg9.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270512/actghzr9eiaeksl9yhbr.png"
           
        ],

        Gray : [
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270377/fbhip0oiefxjqvvkkoko.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270466/ebea2q8brxu921uimgqg.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270462/clhntesl2ukmsdtxkqw9.png"
           
        ]
      },
       isNewProduct: false,
       isPromo: false
     
  
     },
   
      
   
     {
       
       name: "Chaquetas Estampadas 2",
       priceWholesale:15000,
       priceRetail: 70000,
       category: "rompevientos",
       gender: "hombre",
       sizes: ["XS", "S", "M", "L"],
       colors: ["DarkSeaGreen", "SteelBlue", "Silver", "SeaGreen", "OliveDrab"],
       imagesByColor: {
       DarkSeaGreen: [
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270494/u6otcjhzt55h1xrh4gkg.png",
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270533/iuiaj5jiceqf9bvadhah.png",
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270373/gpmajlfe5jab9hhfnyg8.png"
        ],
       SteelBlue: [
           "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270505/gnfoyaav8tw9s7szqfwy.png",
           "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270504/gvvtzmmp62crah6mn8rx.png",
           "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270500/wcuedpeaqoo7gshxh37k.png"
          
        ],
       Silver: [
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270487/virneofsg5jwsv3rtut7.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270468/e2isvwju5f8oxinaahoh.png",
           
        ],
        SeaGreen: [
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270383/uxwk0afxl7ivxhytvkcj.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270379/eiagsipvf3ydfwbvd3bq.png"
         
           
        ],

        OliveDrab: [
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270367/hzco3fche3he4ei8tysa.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270450/zizrmm64qm0ci48w39xo.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270474/y8xrec2ob0j5uusvwfoz.png"
           
        ]
     },

    isNewProduct: false,
    isPromo: false
       
  } ,

   {
       
       name: "Chaquetas estampadas 3",
       priceWholesale:15000,
       priceRetail: 70000,
       category: "rompevientos",
       gender: "hombre",
       sizes: ["XS", "S", "M", "L"],
       colors: ["DarkOrange", "	SeaGreen", "Silver", "SeaGreen", "OliveDrab"],
       imagesByColor: {
       DarkOrange: [
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270447/mmhjoplpmnfyiguqan50.png",
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270449/ui9uuofedik1vtipe1sy.png",
            "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270498/bdjjbiaculozm86kxbkp.png"
        ],
       	SeaGreen: [
           "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270450/zizrmm64qm0ci48w39xo.png",
           "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270367/hzco3fche3he4ei8tysa.png",
           "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270474/y8xrec2ob0j5uusvwfoz.png"
          
        ],
       Silver: [
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270487/virneofsg5jwsv3rtut7.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270468/e2isvwju5f8oxinaahoh.png",
           
        ],
        SeaGreen: [
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270383/uxwk0afxl7ivxhytvkcj.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270379/eiagsipvf3ydfwbvd3bq.png"
         
           
        ],

        OliveDrab: [
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270367/hzco3fche3he4ei8tysa.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270450/zizrmm64qm0ci48w39xo.png",
          "https://res.cloudinary.com/dtwqvxhnm/image/upload/v1771270474/y8xrec2ob0j5uusvwfoz.png"
           
        ]
     },

    isNewProduct: false,
    isPromo: false
       
  }  
   
     
  
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    await Product.deleteMany(); // opcional: limpia la colección
    console.log("🗑️ Productos anteriores eliminados");

    await Product.insertMany(products);
    console.log("🌱 Productos cargados correctamente");

    process.exit();
  } catch (error) {
    console.error("❌ Error al hacer seed:", error);
    process.exit(1);
  }
}

seed();