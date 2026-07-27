const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const patientSchema = new mongoose.Schema({
  mrn: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: Date,
  gender: { type: String, default: 'Male' },
  phone: String,
  email: String,
  bloodGroup: String,
  address: { street: String, city: String, district: String, province: String },
  emergencyContact: { name: String, phone: String, relationship: String },
  allergies: [String],
  chronicConditions: [String]
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

const patients = [
  { mrn:"LIN-000001", firstName:"Aarav", lastName:"Shrestha", phone:"+977-9813000001", email:"aarav.shrestha001@example.com", bloodGroup:"O+", street:"New Baneshwor", city:"Kathmandu", district:"Kathmandu", relName:"Sita Shrestha", relPhone:"+977-9814000001" },
  { mrn:"LIN-000002", firstName:"Anisha", lastName:"Gurung", phone:"+977-9813000002", email:"anisha.gurung002@example.com", bloodGroup:"A+", street:"Lakeside", city:"Pokhara", district:"Kaski", relName:"Ramesh Gurung", relPhone:"+977-9814000002" },
  { mrn:"LIN-000003", firstName:"Prakash", lastName:"Thapa", phone:"+977-9813000003", email:"prakash.thapa003@example.com", bloodGroup:"B+", street:"Bharatpur-10", city:"Bharatpur", district:"Chitwan", relName:"Maya Thapa", relPhone:"+977-9814000003" },
  { mrn:"LIN-000004", firstName:"Nisha", lastName:"Karki", phone:"+977-9813000004", email:"nisha.karki004@example.com", bloodGroup:"AB+", street:"Itahari-5", city:"Itahari", district:"Sunsari", relName:"Hari Karki", relPhone:"+977-9814000004" },
  { mrn:"LIN-000005", firstName:"Bikash", lastName:"Rai", phone:"+977-9813000005", email:"bikash.rai005@example.com", bloodGroup:"O-", street:"Dharan-12", city:"Dharan", district:"Sunsari", relName:"Laxmi Rai", relPhone:"+977-9814000005" },
  { mrn:"LIN-000006", firstName:"Rohan", lastName:"Adhikari", phone:"+977-9813000006", email:"rohan.adhikari006@example.com", bloodGroup:"A-", street:"Kalanki", city:"Kathmandu", district:"Kathmandu", relName:"Meena Adhikari", relPhone:"+977-9814000006" },
  { mrn:"LIN-000007", firstName:"Sagar", lastName:"Koirala", phone:"+977-9813000007", email:"sagar.koirala007@example.com", bloodGroup:"O+", street:"Bhaktapur-2", city:"Bhaktapur", district:"Bhaktapur", relName:"Gita Koirala", relPhone:"+977-9814000007" },
  { mrn:"LIN-000008", firstName:"Priya", lastName:"Poudel", phone:"+977-9813000008", email:"priya.poudel008@example.com", bloodGroup:"B-", street:"Hetauda-4", city:"Hetauda", district:"Makwanpur", relName:"Krishna Poudel", relPhone:"+977-9814000008" },
  { mrn:"LIN-000009", firstName:"Milan", lastName:"Sharma", phone:"+977-9813000009", email:"milan.sharma009@example.com", bloodGroup:"A+", street:"Janakpur-8", city:"Janakpur", district:"Dhanusha", relName:"Sushila Sharma", relPhone:"+977-9814000009" },
  { mrn:"LIN-000010", firstName:"Sunita", lastName:"Rai", phone:"+977-9813000010", email:"sunita.rai010@example.com", bloodGroup:"O+", street:"Dharan-9", city:"Dharan", district:"Sunsari", relName:"Ram Rai", relPhone:"+977-9814000010" },
  { mrn:"LIN-000011", firstName:"Deepak", lastName:"Magar", phone:"+977-9813000011", email:"deepak.magar011@example.com", bloodGroup:"AB-", street:"Butwal-10", city:"Butwal", district:"Rupandehi", relName:"Sita Magar", relPhone:"+977-9814000011" },
  { mrn:"LIN-000012", firstName:"Kiran", lastName:"BK", phone:"+977-9813000012", email:"kiran.bk012@example.com", bloodGroup:"B+", street:"Nepalgunj-3", city:"Nepalgunj", district:"Banke", relName:"Laxmi BK", relPhone:"+977-9814000012" },
  { mrn:"LIN-000013", firstName:"Alina", lastName:"Lama", phone:"+977-9813000013", email:"alina.lama013@example.com", bloodGroup:"A+", street:"Boudha", city:"Kathmandu", district:"Kathmandu", relName:"Dorje Lama", relPhone:"+977-9814000013" },
  { mrn:"LIN-000014", firstName:"Roshan", lastName:"Tamang", phone:"+977-9813000014", email:"roshan.tamang014@example.com", bloodGroup:"O+", street:"Banepa-6", city:"Banepa", district:"Kavre", relName:"Maya Tamang", relPhone:"+977-9814000014" },
  { mrn:"LIN-000015", firstName:"Ashmita", lastName:"Poudel", phone:"+977-9813000015", email:"ashmita.poudel015@example.com", bloodGroup:"B+", street:"Hetauda-7", city:"Hetauda", district:"Makwanpur", relName:"Hari Poudel", relPhone:"+977-9814000015" },
  { mrn:"LIN-000016", firstName:"Rabin", lastName:"Oli", phone:"+977-9813000016", email:"rabin.oli016@example.com", bloodGroup:"AB+", street:"Ghorahi-11", city:"Ghorahi", district:"Dang", relName:"Bimala Oli", relPhone:"+977-9814000016" },
  { mrn:"LIN-000017", firstName:"Manisha", lastName:"Karki", phone:"+977-9813000017", email:"manisha.karki017@example.com", bloodGroup:"A-", street:"Damak-5", city:"Damak", district:"Jhapa", relName:"Suresh Karki", relPhone:"+977-9814000017" },
  { mrn:"LIN-000018", firstName:"Prabin", lastName:"Basnet", phone:"+977-9813000018", email:"prabin.basnet018@example.com", bloodGroup:"O-", street:"Kirtipur", city:"Kathmandu", district:"Kathmandu", relName:"Sabina Basnet", relPhone:"+977-9814000018" },
  { mrn:"LIN-000019", firstName:"Nirmala", lastName:"Khadka", phone:"+977-9813000019", email:"nirmala.khadka019@example.com", bloodGroup:"B+", street:"Tulsipur", city:"Tulsipur", district:"Dang", relName:"Hari Khadka", relPhone:"+977-9814000019" },
  { mrn:"LIN-000020", firstName:"Suman", lastName:"Neupane", phone:"+977-9813000020", email:"suman.neupane020@example.com", bloodGroup:"A+", street:"Biratnagar-6", city:"Biratnagar", district:"Morang", relName:"Rita Neupane", relPhone:"+977-9814000020" },
  { mrn:"LIN-000021", firstName:"Rekha", lastName:"Dahal", phone:"+977-9813000021", email:"rekha.dahal021@example.com", bloodGroup:"O+", street:"Birtamod", city:"Birtamod", district:"Jhapa", relName:"Ramesh Dahal", relPhone:"+977-9814000021" },
  { mrn:"LIN-000022", firstName:"Anil", lastName:"Ghimire", phone:"+977-9813000022", email:"anil.ghimire022@example.com", bloodGroup:"AB-", street:"Chitwan-12", city:"Chitwan", district:"Chitwan", relName:"Ganga Ghimire", relPhone:"+977-9814000022" },
  { mrn:"LIN-000023", firstName:"Binita", lastName:"Sapkota", phone:"+977-9813000023", email:"binita.sapkota023@example.com", bloodGroup:"A+", street:"Bhairahawa", city:"Bhairahawa", district:"Rupandehi", relName:"Shyam Sapkota", relPhone:"+977-9814000023" },
  { mrn:"LIN-000024", firstName:"Bishal", lastName:"Bhandari", phone:"+977-9813000024", email:"bishal.bhandari024@example.com", bloodGroup:"B-", street:"Dhangadhi", city:"Dhangadhi", district:"Kailali", relName:"Mina Bhandari", relPhone:"+977-9814000024" },
  { mrn:"LIN-000025", firstName:"Smriti", lastName:"Pandey", phone:"+977-9813000025", email:"smriti.pandey025@example.com", bloodGroup:"O+", street:"Ilam Bazaar", city:"Ilam", district:"Ilam", relName:"Keshav Pandey", relPhone:"+977-9814000025" },
  { mrn:"LIN-000026", firstName:"Rajesh", lastName:"Khatri", phone:"+977-9813000026", email:"rajesh.khatri026@example.com", bloodGroup:"A-", street:"Surkhet", city:"Surkhet", district:"Surkhet", relName:"Goma Khatri", relPhone:"+977-9814000026" },
  { mrn:"LIN-000027", firstName:"Arjun", lastName:"Gautam", phone:"+977-9813000027", email:"arjun.gautam027@example.com", bloodGroup:"O-", street:"Tokha", city:"Kathmandu", district:"Kathmandu", relName:"Lila Gautam", relPhone:"+977-9814000027" },
  { mrn:"LIN-000028", firstName:"Pooja", lastName:"Rana", phone:"+977-9813000028", email:"pooja.rana028@example.com", bloodGroup:"B+", street:"Bhaktapur", city:"Bhaktapur", district:"Bhaktapur", relName:"Raj Rana", relPhone:"+977-9814000028" },
  { mrn:"LIN-000029", firstName:"Hem Raj", lastName:"KC", phone:"+977-9813000029", email:"hem.kc029@example.com", bloodGroup:"A+", street:"Syangja", city:"Syangja", district:"Syangja", relName:"Gita KC", relPhone:"+977-9814000029" },
  { mrn:"LIN-000030", firstName:"Sita", lastName:"Bista", phone:"+977-9813000030", email:"sita.bista030@example.com", bloodGroup:"O+", street:"Dadeldhura", city:"Dadeldhura", district:"Dadeldhura", relName:"Mohan Bista", relPhone:"+977-9814000030" },
  { mrn:"LIN-000031", firstName:"Dipesh", lastName:"Acharya", phone:"+977-9813000031", email:"dipesh.acharya031@example.com", bloodGroup:"AB+", street:"Lamjung", city:"Lamjung", district:"Lamjung", relName:"Sabina Acharya", relPhone:"+977-9814000031" },
  { mrn:"LIN-000032", firstName:"Kabita", lastName:"Regmi", phone:"+977-9813000032", email:"kabita.regmi032@example.com", bloodGroup:"B-", street:"Palpa", city:"Palpa", district:"Palpa", relName:"Dinesh Regmi", relPhone:"+977-9814000032" },
  { mrn:"LIN-000033", firstName:"Ramesh", lastName:"Bohara", phone:"+977-9813000033", email:"ramesh.bohara033@example.com", bloodGroup:"O-", street:"Doti", city:"Doti", district:"Doti", relName:"Kalpana Bohara", relPhone:"+977-9814000033" },
  { mrn:"LIN-000034", firstName:"Sneha", lastName:"Maharjan", phone:"+977-9813000034", email:"sneha.maharjan034@example.com", bloodGroup:"A+", street:"Patan", city:"Lalitpur", district:"Lalitpur", relName:"Suman Maharjan", relPhone:"+977-9814000034" },
  { mrn:"LIN-000035", firstName:"Ajay", lastName:"Joshi", phone:"+977-9813000035", email:"ajay.joshi035@example.com", bloodGroup:"B+", street:"Mahendranagar", city:"Mahendranagar", district:"Kanchanpur", relName:"Rekha Joshi", relPhone:"+977-9814000035" },
  { mrn:"LIN-000036", firstName:"Sandhya", lastName:"Dhakal", phone:"+977-9813000036", email:"sandhya.dhakal036@example.com", bloodGroup:"AB-", street:"Gorkha", city:"Gorkha", district:"Gorkha", relName:"Narayan Dhakal", relPhone:"+977-9814000036" },
  { mrn:"LIN-000037", firstName:"Prakash", lastName:"Rijal", phone:"+977-9813000037", email:"prakash.rijal037@example.com", bloodGroup:"O+", street:"Sindhuli", city:"Sindhuli", district:"Sindhuli", relName:"Bina Rijal", relPhone:"+977-9814000037" },
  { mrn:"LIN-000038", firstName:"Laxmi", lastName:"Aryal", phone:"+977-9813000038", email:"laxmi.aryal038@example.com", bloodGroup:"A-", street:"Arghakhanchi", city:"Arghakhanchi", district:"Arghakhanchi", relName:"Ram Aryal", relPhone:"+977-9814000038" },
  { mrn:"LIN-000039", firstName:"Ujjwal", lastName:"Kafle", phone:"+977-9813000039", email:"ujjwal.kafle039@example.com", bloodGroup:"B+", street:"Nuwakot", city:"Nuwakot", district:"Nuwakot", relName:"Sushma Kafle", relPhone:"+977-9814000039" },
  { mrn:"LIN-000040", firstName:"Saroj", lastName:"Tiwari", phone:"+977-9813000040", email:"saroj.tiwari040@example.com", bloodGroup:"O+", street:"Bardiya", city:"Bardiya", district:"Bardiya", relName:"Mina Tiwari", relPhone:"+977-9814000040" },
  { mrn:"LIN-000041", firstName:"Asha", lastName:"Bhusal", phone:"+977-9813000041", email:"asha.bhusal041@example.com", bloodGroup:"AB+", street:"Parbat", city:"Parbat", district:"Parbat", relName:"Kiran Bhusal", relPhone:"+977-9814000041" },
  { mrn:"LIN-000042", firstName:"Dinesh", lastName:"Subedi", phone:"+977-9813000042", email:"dinesh.subedi042@example.com", bloodGroup:"A+", street:"Tanahun", city:"Tanahun", district:"Tanahun", relName:"Sita Subedi", relPhone:"+977-9814000042" },
  { mrn:"LIN-000043", firstName:"Ritu", lastName:"Shahi", phone:"+977-9813000043", email:"ritu.shahi043@example.com", bloodGroup:"B-", street:"Jumla", city:"Jumla", district:"Jumla", relName:"Prem Shahi", relPhone:"+977-9814000043" },
  { mrn:"LIN-000044", firstName:"Bikram", lastName:"Pun", phone:"+977-9813000044", email:"bikram.pun044@example.com", bloodGroup:"O-", street:"Rolpa", city:"Rolpa", district:"Rolpa", relName:"Kamala Pun", relPhone:"+977-9814000044" },
  { mrn:"LIN-000045", firstName:"Menuka", lastName:"Oli", phone:"+977-9813000045", email:"menuka.oli045@example.com", bloodGroup:"A+", street:"Pyuthan", city:"Pyuthan", district:"Pyuthan", relName:"Gopal Oli", relPhone:"+977-9814000045" },
  { mrn:"LIN-000046", firstName:"Shiva", lastName:"Chaulagain", phone:"+977-9813000046", email:"shiva.chaulagain046@example.com", bloodGroup:"B+", street:"Dhading", city:"Dhading", district:"Dhading", relName:"Nirmala Chaulagain", relPhone:"+977-9814000046" },
  { mrn:"LIN-000047", firstName:"Anita", lastName:"Rokka", phone:"+977-9813000047", email:"anita.rokka047@example.com", bloodGroup:"O+", street:"Myagdi", city:"Myagdi", district:"Myagdi", relName:"Kumar Rokka", relPhone:"+977-9814000047" },
  { mrn:"LIN-000048", firstName:"Suraj", lastName:"Bhatt", phone:"+977-9813000048", email:"suraj.bhatt048@example.com", bloodGroup:"AB+", street:"Baitadi", city:"Baitadi", district:"Baitadi", relName:"Gita Bhatt", relPhone:"+977-9814000048" },
  { mrn:"LIN-000049", firstName:"Roshni", lastName:"Kandel", phone:"+977-9813000049", email:"roshni.kandel049@example.com", bloodGroup:"A-", street:"Gulmi", city:"Gulmi", district:"Gulmi", relName:"Hari Kandel", relPhone:"+977-9814000049" },
  { mrn:"LIN-000050", firstName:"Tek Bahadur", lastName:"Ale", phone:"+977-9813000050", email:"tek.ale050@example.com", bloodGroup:"B+", street:"Rukum East", city:"Rukum East", district:"Rukum East", relName:"Bimala Ale", relPhone:"+977-9814000050" },
  { mrn:"LIN-000051", firstName:"Keshav", lastName:"Shrestha", phone:"+977-9813000051", email:"keshav.shrestha051@example.com", bloodGroup:"O+", street:"Budhanilkantha", city:"Kathmandu", district:"Kathmandu", relName:"Sita Shrestha", relPhone:"+977-9814000051" },
  { mrn:"LIN-000052", firstName:"Rina", lastName:"Gurung", phone:"+977-9813000052", email:"rina.gurung052@example.com", bloodGroup:"A+", street:"Pokhara-17", city:"Pokhara", district:"Kaski", relName:"Dhan Gurung", relPhone:"+977-9814000052" },
  { mrn:"LIN-000053", firstName:"Suresh", lastName:"Adhikari", phone:"+977-9813000053", email:"suresh.adhikari053@example.com", bloodGroup:"B+", street:"Bhaktapur-4", city:"Bhaktapur", district:"Bhaktapur", relName:"Kamala Adhikari", relPhone:"+977-9814000053" },
  { mrn:"LIN-000054", firstName:"Nabin", lastName:"Karki", phone:"+977-9813000054", email:"nabin.karki054@example.com", bloodGroup:"AB+", street:"Hetauda-8", city:"Hetauda", district:"Makwanpur", relName:"Ramesh Karki", relPhone:"+977-9814000054" },
  { mrn:"LIN-000055", firstName:"Anju", lastName:"Rai", phone:"+977-9813000055", email:"anju.rai055@example.com", bloodGroup:"O-", street:"Dharan-5", city:"Dharan", district:"Sunsari", relName:"Gopal Rai", relPhone:"+977-9814000055" },
  { mrn:"LIN-000056", firstName:"Dipak", lastName:"Thapa", phone:"+977-9813000056", email:"dipak.thapa056@example.com", bloodGroup:"A-", street:"Butwal-11", city:"Butwal", district:"Rupandehi", relName:"Maya Thapa", relPhone:"+977-9814000056" },
  { mrn:"LIN-000057", firstName:"Sabina", lastName:"Lama", phone:"+977-9813000057", email:"sabina.lama057@example.com", bloodGroup:"B-", street:"Boudha", city:"Kathmandu", district:"Kathmandu", relName:"Dorje Lama", relPhone:"+977-9814000057" },
  { mrn:"LIN-000058", firstName:"Rajan", lastName:"Magar", phone:"+977-9813000058", email:"rajan.magar058@example.com", bloodGroup:"O+", street:"Tansen-6", city:"Tansen", district:"Palpa", relName:"Laxmi Magar", relPhone:"+977-9814000058" },
  { mrn:"LIN-000059", firstName:"Kabita", lastName:"Neupane", phone:"+977-9813000059", email:"kabita.neupane059@example.com", bloodGroup:"A+", street:"Biratnagar-9", city:"Biratnagar", district:"Morang", relName:"Hari Neupane", relPhone:"+977-9814000059" },
  { mrn:"LIN-000060", firstName:"Bikram", lastName:"Khadka", phone:"+977-9813000060", email:"bikram.khadka060@example.com", bloodGroup:"B+", street:"Janakpur-4", city:"Janakpur", district:"Dhanusha", relName:"Gita Khadka", relPhone:"+977-9814000060" },
  { mrn:"LIN-000061", firstName:"Sarita", lastName:"Acharya", phone:"+977-9813000061", email:"sarita.acharya061@example.com", bloodGroup:"AB-", street:"Lamjung Besi", city:"Lamjung", district:"Lamjung", relName:"Ram Acharya", relPhone:"+977-9814000061" },
  { mrn:"LIN-000062", firstName:"Milan", lastName:"Bhandari", phone:"+977-9813000062", email:"milan.bhandari062@example.com", bloodGroup:"O+", street:"Dhangadhi-3", city:"Dhangadhi", district:"Kailali", relName:"Mina Bhandari", relPhone:"+977-9814000062" },
  { mrn:"LIN-000063", firstName:"Roshan", lastName:"Pandey", phone:"+977-9813000063", email:"roshan.pandey063@example.com", bloodGroup:"A-", street:"Ilam Municipality", city:"Ilam", district:"Ilam", relName:"Krishna Pandey", relPhone:"+977-9814000063" },
  { mrn:"LIN-000064", firstName:"Sushma", lastName:"Regmi", phone:"+977-9813000064", email:"sushma.regmi064@example.com", bloodGroup:"B+", street:"Syangja", city:"Syangja", district:"Syangja", relName:"Prakash Regmi", relPhone:"+977-9814000064" },
  { mrn:"LIN-000065", firstName:"Hari", lastName:"Ghimire", phone:"+977-9813000065", email:"hari.ghimire065@example.com", bloodGroup:"O+", street:"Chitwan-6", city:"Chitwan", district:"Chitwan", relName:"Bimala Ghimire", relPhone:"+977-9814000065" },
  { mrn:"LIN-000066", firstName:"Menuka", lastName:"Kandel", phone:"+977-9813000066", email:"menuka.kandel066@example.com", bloodGroup:"AB+", street:"Gulmi Tamghas", city:"Gulmi", district:"Gulmi", relName:"Suresh Kandel", relPhone:"+977-9814000066" },
  { mrn:"LIN-000067", firstName:"Umesh", lastName:"Gautam", phone:"+977-9813000067", email:"umesh.gautam067@example.com", bloodGroup:"A+", street:"Tokha-2", city:"Kathmandu", district:"Kathmandu", relName:"Lila Gautam", relPhone:"+977-9814000067" },
  { mrn:"LIN-000068", firstName:"Anita", lastName:"Chaudhary", phone:"+977-9813000068", email:"anita.chaudhary068@example.com", bloodGroup:"B-", street:"Tikapur", city:"Tikapur", district:"Kailali", relName:"Mohan Chaudhary", relPhone:"+977-9814000068" },
  { mrn:"LIN-000069", firstName:"Sajan", lastName:"Oli", phone:"+977-9813000069", email:"sajan.oli069@example.com", bloodGroup:"O-", street:"Ghorahi", city:"Ghorahi", district:"Dang", relName:"Gita Oli", relPhone:"+977-9814000069" },
  { mrn:"LIN-000070", firstName:"Binod", lastName:"Bhattarai", phone:"+977-9813000070", email:"binod.bhattarai070@example.com", bloodGroup:"A+", street:"Damak", city:"Damak", district:"Jhapa", relName:"Sabina Bhattarai", relPhone:"+977-9814000070" },
  { mrn:"LIN-000071", firstName:"Apsara", lastName:"KC", phone:"+977-9813000071", email:"apsara.kc071@example.com", bloodGroup:"B+", street:"Nepalgunj", city:"Nepalgunj", district:"Banke", relName:"Deepak KC", relPhone:"+977-9814000071" },
  { mrn:"LIN-000072", firstName:"Sanjay", lastName:"Tamang", phone:"+977-9813000072", email:"sanjay.tamang072@example.com", bloodGroup:"O+", street:"Banepa", city:"Banepa", district:"Kavre", relName:"Maya Tamang", relPhone:"+977-9814000072" },
  { mrn:"LIN-000073", firstName:"Gita", lastName:"Maharjan", phone:"+977-9813000073", email:"gita.maharjan073@example.com", bloodGroup:"AB+", street:"Lalitpur-14", city:"Lalitpur", district:"Lalitpur", relName:"Suman Maharjan", relPhone:"+977-9814000073" },
  { mrn:"LIN-000074", firstName:"Ritesh", lastName:"Poudel", phone:"+977-9813000074", email:"ritesh.poudel074@example.com", bloodGroup:"A-", street:"Bharatpur", city:"Bharatpur", district:"Chitwan", relName:"Kamala Poudel", relPhone:"+977-9814000074" },
  { mrn:"LIN-000075", firstName:"Nirmala", lastName:"Bista", phone:"+977-9813000075", email:"nirmala.bista075@example.com", bloodGroup:"B+", street:"Dadeldhura", city:"Dadeldhura", district:"Dadeldhura", relName:"Hari Bista", relPhone:"+977-9814000075" },
  { mrn:"LIN-000076", firstName:"Sunil", lastName:"Bohara", phone:"+977-9813000076", email:"sunil.bohara076@example.com", bloodGroup:"O+", street:"Doti", city:"Doti", district:"Doti", relName:"Kalpana Bohara", relPhone:"+977-9814000076" },
  { mrn:"LIN-000077", firstName:"Pabitra", lastName:"Joshi", phone:"+977-9813000077", email:"pabitra.joshi077@example.com", bloodGroup:"AB-", street:"Mahendranagar", city:"Mahendranagar", district:"Kanchanpur", relName:"Raj Joshi", relPhone:"+977-9814000077" },
  { mrn:"LIN-000078", firstName:"Anil", lastName:"Aryal", phone:"+977-9813000078", email:"anil.aryal078@example.com", bloodGroup:"A+", street:"Arghakhanchi", city:"Arghakhanchi", district:"Arghakhanchi", relName:"Bina Aryal", relPhone:"+977-9814000078" },
  { mrn:"LIN-000079", firstName:"Smita", lastName:"Bhusal", phone:"+977-9813000079", email:"smita.bhusal079@example.com", bloodGroup:"B-", street:"Parbat", city:"Parbat", district:"Parbat", relName:"Kiran Bhusal", relPhone:"+977-9814000079" },
  { mrn:"LIN-000080", firstName:"Roshan", lastName:"Subedi", phone:"+977-9813000080", email:"roshan.subedi080@example.com", bloodGroup:"O+", street:"Tanahun", city:"Tanahun", district:"Tanahun", relName:"Sita Subedi", relPhone:"+977-9814000080" },
  { mrn:"LIN-000081", firstName:"Kabin", lastName:"Pun", phone:"+977-9813000081", email:"kabin.pun081@example.com", bloodGroup:"A+", street:"Rolpa", city:"Rolpa", district:"Rolpa", relName:"Kamala Pun", relPhone:"+977-9814000081" },
  { mrn:"LIN-000082", firstName:"Meena", lastName:"Shahi", phone:"+977-9813000082", email:"meena.shahi082@example.com", bloodGroup:"B+", street:"Jumla", city:"Jumla", district:"Jumla", relName:"Prem Shahi", relPhone:"+977-9814000082" },
  { mrn:"LIN-000083", firstName:"Rabina", lastName:"Ale", phone:"+977-9813000083", email:"rabina.ale083@example.com", bloodGroup:"O-", street:"Rukum East", city:"Rukum East", district:"Rukum East", relName:"Dhan Ale", relPhone:"+977-9814000083" },
  { mrn:"LIN-000084", firstName:"Prabin", lastName:"Sapkota", phone:"+977-9813000084", email:"prabin.sapkota084@example.com", bloodGroup:"AB+", street:"Bhairahawa", city:"Bhairahawa", district:"Rupandehi", relName:"Mina Sapkota", relPhone:"+977-9814000084" },
  { mrn:"LIN-000085", firstName:"Sangita", lastName:"Dhakal", phone:"+977-9813000085", email:"sangita.dhakal085@example.com", bloodGroup:"A+", street:"Gorkha", city:"Gorkha", district:"Gorkha", relName:"Narayan Dhakal", relPhone:"+977-9814000085" },
  { mrn:"LIN-000086", firstName:"Tek Raj", lastName:"Rijal", phone:"+977-9813000086", email:"tek.rijal086@example.com", bloodGroup:"O+", street:"Sindhuli", city:"Sindhuli", district:"Sindhuli", relName:"Bina Rijal", relPhone:"+977-9814000086" },
  { mrn:"LIN-000087", firstName:"Raju", lastName:"Kafle", phone:"+977-9813000087", email:"raju.kafle087@example.com", bloodGroup:"B+", street:"Nuwakot", city:"Nuwakot", district:"Nuwakot", relName:"Sushma Kafle", relPhone:"+977-9814000087" },
  { mrn:"LIN-000088", firstName:"Laxmi", lastName:"Tiwari", phone:"+977-9813000088", email:"laxmi.tiwari088@example.com", bloodGroup:"A-", street:"Bardiya", city:"Bardiya", district:"Bardiya", relName:"Mohan Tiwari", relPhone:"+977-9814000088" },
  { mrn:"LIN-000089", firstName:"Dinesh", lastName:"Chaulagain", phone:"+977-9813000089", email:"dinesh.chaulagain089@example.com", bloodGroup:"O+", street:"Dhading", city:"Dhading", district:"Dhading", relName:"Nirmala Chaulagain", relPhone:"+977-9814000089" },
  { mrn:"LIN-000090", firstName:"Sushila", lastName:"Rokka", phone:"+977-9813000090", email:"sushila.rokka090@example.com", bloodGroup:"AB+", street:"Myagdi", city:"Myagdi", district:"Myagdi", relName:"Kumar Rokka", relPhone:"+977-9814000090" },
  { mrn:"LIN-000091", firstName:"Ashok", lastName:"Bhatt", phone:"+977-9813000091", email:"ashok.bhatt091@example.com", bloodGroup:"A+", street:"Baitadi", city:"Baitadi", district:"Baitadi", relName:"Gita Bhatt", relPhone:"+977-9814000091" },
  { mrn:"LIN-000092", firstName:"Pooja", lastName:"Basnet", phone:"+977-9813000092", email:"pooja.basnet092@example.com", bloodGroup:"B-", street:"Kirtipur", city:"Kathmandu", district:"Kathmandu", relName:"Sabina Basnet", relPhone:"+977-9814000092" },
  { mrn:"LIN-000093", firstName:"Rajesh", lastName:"Koirala", phone:"+977-9813000093", email:"rajesh.koirala093@example.com", bloodGroup:"O+", street:"Biratnagar", city:"Biratnagar", district:"Morang", relName:"Sita Koirala", relPhone:"+977-9814000093" },
  { mrn:"LIN-000094", firstName:"Nisha", lastName:"Ghimire", phone:"+977-9813000094", email:"nisha.ghimire094@example.com", bloodGroup:"A-", street:"Besisahar", city:"Besisahar", district:"Lamjung", relName:"Ram Ghimire", relPhone:"+977-9814000094" },
  { mrn:"LIN-000095", firstName:"Hemanta", lastName:"Adhikari", phone:"+977-9813000095", email:"hemanta.adhikari095@example.com", bloodGroup:"B+", street:"Chabahil", city:"Kathmandu", district:"Kathmandu", relName:"Meena Adhikari", relPhone:"+977-9814000095" },
  { mrn:"LIN-000096", firstName:"Bimala", lastName:"Rana", phone:"+977-9813000096", email:"bimala.rana096@example.com", bloodGroup:"O+", street:"Bhaktapur", city:"Bhaktapur", district:"Bhaktapur", relName:"Raj Rana", relPhone:"+977-9814000096" },
  { mrn:"LIN-000097", firstName:"Kiran", lastName:"Khatri", phone:"+977-9813000097", email:"kiran.khatri097@example.com", bloodGroup:"AB-", street:"Surkhet", city:"Surkhet", district:"Surkhet", relName:"Goma Khatri", relPhone:"+977-9814000097" },
  { mrn:"LIN-000098", firstName:"Sunita", lastName:"Pandit", phone:"+977-9813000098", email:"sunita.pandit098@example.com", bloodGroup:"A+", street:"Baglung", city:"Baglung", district:"Baglung", relName:"Hari Pandit", relPhone:"+977-9814000098" },
  { mrn:"LIN-000099", firstName:"Ramesh", lastName:"Bishwakarma", phone:"+977-9813000099", email:"ramesh.bk099@example.com", bloodGroup:"B+", street:"Bardibas", city:"Bardibas", district:"Mahottari", relName:"Sushila Bishwakarma", relPhone:"+977-9814000099" },
  { mrn:"LIN-000100", firstName:"Alisha", lastName:"Shahi", phone:"+977-9813000100", email:"alisha.shahi100@example.com", bloodGroup:"O+", street:"Dullu", city:"Dullu", district:"Dailekh", relName:"Tek Shahi", relPhone:"+977-9814000100" }
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lincoln_hospital');
  console.log('Connected');

  // Drop old patients
  await Patient.deleteMany({});
  console.log('Cleared old patients');

  let inserted = 0;
  for (const p of patients) {
    try {
      await new Patient({
        mrn: p.mrn,
        firstName: p.firstName,
        lastName: p.lastName,
        gender: 'Male',
        phone: p.phone,
        email: p.email,
        bloodGroup: p.bloodGroup,
        address: { street: p.street, city: p.city, district: p.district, province: '' },
        emergencyContact: { name: p.relName, phone: p.relPhone, relationship: 'Relative' }
      }).save();
      inserted++;
      console.log(`Created: ${p.mrn} - ${p.firstName} ${p.lastName}`);
    } catch (err) {
      console.log(`Error: ${p.mrn} - ${err.message}`);
    }
  }

  console.log(`\nDone. Total: ${inserted} patients`);
  process.exit(0);
})();
