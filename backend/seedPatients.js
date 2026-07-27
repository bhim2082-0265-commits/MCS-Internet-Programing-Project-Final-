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
  address: {
    street: String,
    city: String,
    district: String,
    province: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  allergies: [String],
  chronicConditions: [String]
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

const patients = [
  { mrn: "NP000006", firstName: "Rohan", lastName: "Adhikari", phone: "+977-9812345006", email: "rohan.adhikari006@example.com", bloodGroup: "A-", street: "Kalanki", city: "Kathmandu", district: "Kathmandu", relName: "Meena Adhikari", relPhone: "+977-9812346006" },
  { mrn: "NP000007", firstName: "Anisha", lastName: "Shrestha", phone: "+977-9812345007", email: "anisha.shrestha007@example.com", bloodGroup: "B+", street: "Lalitpur-5", city: "Lalitpur", district: "Lalitpur", relName: "Raju Shrestha", relPhone: "+977-9812346007" },
  { mrn: "NP000008", firstName: "Sagar", lastName: "Koirala", phone: "+977-9812345008", email: "sagar.koirala008@example.com", bloodGroup: "O+", street: "Bhaktapur-2", city: "Bhaktapur", district: "Bhaktapur", relName: "Gita Koirala", relPhone: "+977-9812346008" },
  { mrn: "NP000009", firstName: "Priya", lastName: "Thapa", phone: "+977-9812345009", email: "priya.thapa009@example.com", bloodGroup: "AB+", street: "Pokhara-7", city: "Pokhara", district: "Kaski", relName: "Hari Thapa", relPhone: "+977-9812346009" },
  { mrn: "NP000010", firstName: "Nabin", lastName: "Gurung", phone: "+977-9812345010", email: "nabin.gurung010@example.com", bloodGroup: "B-", street: "Lekhnath", city: "Kaski", district: "Kaski", relName: "Kamala Gurung", relPhone: "+977-9812346010" },
  { mrn: "NP000011", firstName: "Sunita", lastName: "Rai", phone: "+977-9812345011", email: "sunita.rai011@example.com", bloodGroup: "O-", street: "Dharan-9", city: "Dharan", district: "Sunsari", relName: "Ram Rai", relPhone: "+977-9812346011" },
  { mrn: "NP000012", firstName: "Deepak", lastName: "Magar", phone: "+977-9812345012", email: "deepak.magar012@example.com", bloodGroup: "A+", street: "Butwal-10", city: "Butwal", district: "Rupandehi", relName: "Sita Magar", relPhone: "+977-9812346012" },
  { mrn: "NP000013", firstName: "Kiran", lastName: "BK", phone: "+977-9812345013", email: "kiran.bk013@example.com", bloodGroup: "B+", street: "Nepalgunj-3", city: "Nepalgunj", district: "Banke", relName: "Laxmi BK", relPhone: "+977-9812346013" },
  { mrn: "NP000014", firstName: "Alina", lastName: "Lama", phone: "+977-9812345014", email: "alina.lama014@example.com", bloodGroup: "AB-", street: "Boudha", city: "Kathmandu", district: "Kathmandu", relName: "Dorje Lama", relPhone: "+977-9812346014" },
  { mrn: "NP000015", firstName: "Roshan", lastName: "Tamang", phone: "+977-9812345015", email: "roshan.tamang015@example.com", bloodGroup: "O+", street: "Banepa-6", city: "Banepa", district: "Kavre", relName: "Maya Tamang", relPhone: "+977-9812346015" },
  { mrn: "NP000016", firstName: "Ashmita", lastName: "Poudel", phone: "+977-9812345016", email: "ashmita.poudel016@example.com", bloodGroup: "A+", street: "Hetauda-4", city: "Hetauda", district: "Makwanpur", relName: "Krishna Poudel", relPhone: "+977-9812346016" },
  { mrn: "NP000017", firstName: "Milan", lastName: "Sharma", phone: "+977-9812345017", email: "milan.sharma017@example.com", bloodGroup: "B-", street: "Janakpur-8", city: "Janakpur", district: "Dhanusha", relName: "Sushila Sharma", relPhone: "+977-9812346017" },
  { mrn: "NP000018", firstName: "Sarita", lastName: "Chaudhary", phone: "+977-9812345018", email: "sarita.chaudhary018@example.com", bloodGroup: "O+", street: "Tikapur-2", city: "Tikapur", district: "Kailali", relName: "Mohan Chaudhary", relPhone: "+977-9812346018" },
  { mrn: "NP000019", firstName: "Rabin", lastName: "Oli", phone: "+977-9812345019", email: "rabin.oli019@example.com", bloodGroup: "AB+", street: "Ghorahi-11", city: "Ghorahi", district: "Dang", relName: "Bimala Oli", relPhone: "+977-9812346019" },
  { mrn: "NP000020", firstName: "Manisha", lastName: "Karki", phone: "+977-9812345020", email: "manisha.karki020@example.com", bloodGroup: "A-", street: "Damak-5", city: "Damak", district: "Jhapa", relName: "Suresh Karki", relPhone: "+977-9812346020" },
  { mrn: "NP000021", firstName: "Prabin", lastName: "Basnet", phone: "+977-9812345021", email: "prabin.basnet021@example.com", bloodGroup: "O-", street: "Kirtipur", city: "Kathmandu", district: "Kathmandu", relName: "Sabina Basnet", relPhone: "+977-9812346021" },
  { mrn: "NP000022", firstName: "Nirmala", lastName: "Khadka", phone: "+977-9812345022", email: "nirmala.khadka022@example.com", bloodGroup: "B+", street: "Tulsipur", city: "Tulsipur", district: "Dang", relName: "Hari Khadka", relPhone: "+977-9812346022" },
  { mrn: "NP000023", firstName: "Suman", lastName: "Neupane", phone: "+977-9812345023", email: "suman.neupane023@example.com", bloodGroup: "A+", street: "Biratnagar-6", city: "Biratnagar", district: "Morang", relName: "Rita Neupane", relPhone: "+977-9812346023" },
  { mrn: "NP000024", firstName: "Rekha", lastName: "Dahal", phone: "+977-9812345024", email: "rekha.dahal024@example.com", bloodGroup: "O+", street: "Birtamod", city: "Birtamod", district: "Jhapa", relName: "Ramesh Dahal", relPhone: "+977-9812346024" },
  { mrn: "NP000025", firstName: "Anil", lastName: "Ghimire", phone: "+977-9812345025", email: "anil.ghimire025@example.com", bloodGroup: "AB-", street: "Chitwan-12", city: "Chitwan", district: "Chitwan", relName: "Ganga Ghimire", relPhone: "+977-9812346025" },
  { mrn: "NP000026", firstName: "Binita", lastName: "Sapkota", phone: "+977-9812345026", email: "binita.sapkota026@example.com", bloodGroup: "A+", street: "Bhairahawa", city: "Bhairahawa", district: "Rupandehi", relName: "Shyam Sapkota", relPhone: "+977-9812346026" },
  { mrn: "NP000027", firstName: "Bishal", lastName: "Bhandari", phone: "+977-9812345027", email: "bishal.bhandari027@example.com", bloodGroup: "B-", street: "Dhangadhi", city: "Dhangadhi", district: "Kailali", relName: "Mina Bhandari", relPhone: "+977-9812346027" },
  { mrn: "NP000028", firstName: "Smriti", lastName: "Pandey", phone: "+977-9812345028", email: "smriti.pandey028@example.com", bloodGroup: "O+", street: "Ilam Bazaar", city: "Ilam", district: "Ilam", relName: "Keshav Pandey", relPhone: "+977-9812346028" },
  { mrn: "NP000029", firstName: "Rajesh", lastName: "Khatri", phone: "+977-9812345029", email: "rajesh.khatri029@example.com", bloodGroup: "A-", street: "Surkhet", city: "Surkhet", district: "Surkhet", relName: "Goma Khatri", relPhone: "+977-9812346029" },
  { mrn: "NP000030", firstName: "Nisha", lastName: "Adhikari", phone: "+977-9812345030", email: "nisha.adhikari030@example.com", bloodGroup: "AB+", street: "Dhulikhel", city: "Dhulikhel", district: "Kavre", relName: "Santosh Adhikari", relPhone: "+977-9812346030" },
  { mrn: "NP000031", firstName: "Arjun", lastName: "Gautam", phone: "+977-9812345031", email: "arjun.gautam031@example.com", bloodGroup: "O-", street: "Tokha", city: "Kathmandu", district: "Kathmandu", relName: "Lila Gautam", relPhone: "+977-9812346031" },
  { mrn: "NP000032", firstName: "Pooja", lastName: "Rana", phone: "+977-9812345032", email: "pooja.rana032@example.com", bloodGroup: "B+", street: "Bhaktapur", city: "Bhaktapur", district: "Bhaktapur", relName: "Raj Rana", relPhone: "+977-9812346032" },
  { mrn: "NP000033", firstName: "Hem Raj", lastName: "KC", phone: "+977-9812345033", email: "hem.kc033@example.com", bloodGroup: "A+", street: "Syangja", city: "Syangja", district: "Syangja", relName: "Gita KC", relPhone: "+977-9812346033" },
  { mrn: "NP000034", firstName: "Sita", lastName: "Bista", phone: "+977-9812345034", email: "sita.bista034@example.com", bloodGroup: "O+", street: "Dadeldhura", city: "Dadeldhura", district: "Dadeldhura", relName: "Mohan Bista", relPhone: "+977-9812346034" },
  { mrn: "NP000035", firstName: "Dipesh", lastName: "Acharya", phone: "+977-9812345035", email: "dipesh.acharya035@example.com", bloodGroup: "AB+", street: "Lamjung", city: "Lamjung", district: "Lamjung", relName: "Sabina Acharya", relPhone: "+977-9812346035" },
  { mrn: "NP000036", firstName: "Kabita", lastName: "Regmi", phone: "+977-9812345036", email: "kabita.regmi036@example.com", bloodGroup: "B-", street: "Palpa", city: "Palpa", district: "Palpa", relName: "Dinesh Regmi", relPhone: "+977-9812346036" },
  { mrn: "NP000037", firstName: "Ramesh", lastName: "Bohara", phone: "+977-9812345037", email: "ramesh.bohara037@example.com", bloodGroup: "O-", street: "Doti", city: "Doti", district: "Doti", relName: "Kalpana Bohara", relPhone: "+977-9812346037" },
  { mrn: "NP000038", firstName: "Sneha", lastName: "Maharjan", phone: "+977-9812345038", email: "sneha.maharjan038@example.com", bloodGroup: "A+", street: "Patan", city: "Lalitpur", district: "Lalitpur", relName: "Suman Maharjan", relPhone: "+977-9812346038" },
  { mrn: "NP000039", firstName: "Ajay", lastName: "Joshi", phone: "+977-9812345039", email: "ajay.joshi039@example.com", bloodGroup: "B+", street: "Mahendranagar", city: "Mahendranagar", district: "Kanchanpur", relName: "Rekha Joshi", relPhone: "+977-9812346039" },
  { mrn: "NP000040", firstName: "Sandhya", lastName: "Dhakal", phone: "+977-9812345040", email: "sandhya.dhakal040@example.com", bloodGroup: "AB-", street: "Gorkha", city: "Gorkha", district: "Gorkha", relName: "Narayan Dhakal", relPhone: "+977-9812346040" },
  { mrn: "NP000041", firstName: "Prakash", lastName: "Rijal", phone: "+977-9812345041", email: "prakash.rijal041@example.com", bloodGroup: "O+", street: "Sindhuli", city: "Sindhuli", district: "Sindhuli", relName: "Bina Rijal", relPhone: "+977-9812346041" },
  { mrn: "NP000042", firstName: "Laxmi", lastName: "Aryal", phone: "+977-9812345042", email: "laxmi.aryal042@example.com", bloodGroup: "A-", street: "Arghakhanchi", city: "Arghakhanchi", district: "Arghakhanchi", relName: "Ram Aryal", relPhone: "+977-9812346042" },
  { mrn: "NP000043", firstName: "Ujjwal", lastName: "Kafle", phone: "+977-9812345043", email: "ujjwal.kafle043@example.com", bloodGroup: "B+", street: "Nuwakot", city: "Nuwakot", district: "Nuwakot", relName: "Sushma Kafle", relPhone: "+977-9812346043" },
  { mrn: "NP000044", firstName: "Saroj", lastName: "Tiwari", phone: "+977-9812345044", email: "saroj.tiwari044@example.com", bloodGroup: "O+", street: "Bardiya", city: "Bardiya", district: "Bardiya", relName: "Mina Tiwari", relPhone: "+977-9812346044" },
  { mrn: "NP000045", firstName: "Asha", lastName: "Bhusal", phone: "+977-9812345045", email: "asha.bhusal045@example.com", bloodGroup: "AB+", street: "Parbat", city: "Parbat", district: "Parbat", relName: "Kiran Bhusal", relPhone: "+977-9812346045" },
  { mrn: "NP000046", firstName: "Dinesh", lastName: "Subedi", phone: "+977-9812345046", email: "dinesh.subedi046@example.com", bloodGroup: "A+", street: "Tanahun", city: "Tanahun", district: "Tanahun", relName: "Sita Subedi", relPhone: "+977-9812346046" },
  { mrn: "NP000047", firstName: "Ritu", lastName: "Shahi", phone: "+977-9812345047", email: "ritu.shahi047@example.com", bloodGroup: "B-", street: "Jumla", city: "Jumla", district: "Jumla", relName: "Prem Shahi", relPhone: "+977-9812346047" },
  { mrn: "NP000048", firstName: "Bikram", lastName: "Pun", phone: "+977-9812345048", email: "bikram.pun048@example.com", bloodGroup: "O-", street: "Rolpa", city: "Rolpa", district: "Rolpa", relName: "Kamala Pun", relPhone: "+977-9812346048" },
  { mrn: "NP000049", firstName: "Menuka", lastName: "Oli", phone: "+977-9812345049", email: "menuka.oli049@example.com", bloodGroup: "A+", street: "Pyuthan", city: "Pyuthan", district: "Pyuthan", relName: "Gopal Oli", relPhone: "+977-9812346049" },
  { mrn: "NP000050", firstName: "Shiva", lastName: "Chaulagain", phone: "+977-9812345050", email: "shiva.chaulagain050@example.com", bloodGroup: "B+", street: "Dhading", city: "Dhading", district: "Dhading", relName: "Nirmala Chaulagain", relPhone: "+977-9812346050" },
  { mrn: "NP000051", firstName: "Anita", lastName: "Rokka", phone: "+977-9812345051", email: "anita.rokka051@example.com", bloodGroup: "O+", street: "Myagdi", city: "Myagdi", district: "Myagdi", relName: "Kumar Rokka", relPhone: "+977-9812346051" },
  { mrn: "NP000052", firstName: "Suraj", lastName: "Bhatt", phone: "+977-9812345052", email: "suraj.bhatt052@example.com", bloodGroup: "AB+", street: "Baitadi", city: "Baitadi", district: "Baitadi", relName: "Gita Bhatt", relPhone: "+977-9812346052" },
  { mrn: "NP000053", firstName: "Roshni", lastName: "Kandel", phone: "+977-9812345053", email: "roshni.kandel053@example.com", bloodGroup: "A-", street: "Gulmi", city: "Gulmi", district: "Gulmi", relName: "Hari Kandel", relPhone: "+977-9812346053" },
  { mrn: "NP000054", firstName: "Tek Bahadur", lastName: "Ale", phone: "+977-9812345054", email: "tek.ale054@example.com", bloodGroup: "B+", street: "Rukum East", city: "Rukum East", district: "Rukum East", relName: "Bimala Ale", relPhone: "+977-9812346054" },
  { mrn: "NP000055", firstName: "Sabina", lastName: "Lama", phone: "+977-9812345055", email: "sabina.lama055@example.com", bloodGroup: "O+", street: "Sindhupalchok", city: "Sindhupalchok", district: "Sindhupalchok", relName: "Dorje Lama", relPhone: "+977-9812346055" }
];

const seedPatients = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lincoln_hospital');
    console.log('MongoDB Connected');

    let inserted = 0;
    let skipped = 0;

    for (const p of patients) {
      try {
        const existing = await Patient.findOne({ mrn: p.mrn });
        if (existing) { skipped++; continue; }

        const patient = new Patient({
          mrn: p.mrn,
          firstName: p.firstName,
          lastName: p.lastName,
          gender: 'Male',
          phone: p.phone,
          email: p.email,
          bloodGroup: p.bloodGroup,
          address: { street: p.street, city: p.city, district: p.district, province: '' },
          emergencyContact: { name: p.relName, phone: p.relPhone, relationship: 'Relative' }
        });
        await patient.save();
        inserted++;
        console.log(`Created: ${p.mrn} - ${p.firstName} ${p.lastName}`);
      } catch (err) {
        skipped++;
      }
    }

    console.log(`\n=== SEED COMPLETE ===`);
    console.log(`Inserted: ${inserted}, Skipped: ${skipped}`);
    console.log(`Total patients: ${await Patient.countDocuments()}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedPatients();
