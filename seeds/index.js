const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser : true,
    useUnifiedTopology : true,
});

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'))
db.once('open',() =>{
    console.log('Database Connected');
});

const sample = array => array[Math.floor(Math.random()* array.length)];
const seedDB = async ()=>{
    await Campground.deleteMany({});
    for(let i=0;i<300;i++)
    {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()* 20) + 10;
        const camp = new Campground({
            author:'624936964e2b327da07fcfb3',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Deleniti obcaecati quos ad doloribus vitae repellendus non aperiam, similique optio ex eaque magni fuga inventore voluptatibus quae laboriosam eos odio ducimus.',
            price ,
            geometry:{
                type:'Point',
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude
            ]
            },
            images:  [
                {
                  url: 'https://res.cloudinary.com/dn8qjgpkk/image/upload/v1649310971/YelpCamp/rw5tvnu8tnjpybccncxf.jpg',
                  filename: 'YelpCamp/rw5tvnu8tnjpybccncxf'
                },
                {
                  url: 'https://res.cloudinary.com/dn8qjgpkk/image/upload/v1649310993/YelpCamp/xmpvojfttx9q2lokjtga.jpg',
                  filename: 'YelpCamp/xmpvojfttx9q2lokjtga'
                }
              ]
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})