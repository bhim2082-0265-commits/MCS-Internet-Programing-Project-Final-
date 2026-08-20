import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const photos = ['/images/photo1.jpg', '/images/photo2.jpg', '/images/photo3.jpg', '/images/photo4.jpg', '/images/photo5.jpg', '/images/photo6.jpg'];

const services = [
  { icon: '❤️', title: 'Cardiology', desc: 'Comprehensive heart care with advanced diagnostic and treatment facilities.' },
  { icon: '🛡️', title: 'Emergency Care', desc: '24/7 emergency services with rapid response teams and modern trauma care.' },
  { icon: '🔬', title: 'Laboratory', desc: 'State-of-the-art laboratory with accurate and timely diagnostic testing.' },
  { icon: '📖', title: 'Radiology', desc: 'Advanced imaging services including MRI, CT scan, X-ray, and ultrasound.' },
  { icon: '📦', title: 'Pharmacy', desc: 'Full-service pharmacy with genuine medications and expert pharmaceutical advice.' },
  { icon: '📋', title: 'Outpatient Dept.', desc: 'Efficient OPD services with experienced specialists and minimal wait times.' },
  { icon: '👤', title: 'General Medicine', desc: 'Expert general physicians providing holistic healthcare for all ages.' },
  { icon: '🎥', title: 'Telemedicine', desc: 'Virtual consultations connecting patients with doctors from the comfort of home.' },
];

const testimonials = [
  { name: 'Suman Neupane', text: 'The doctors and staff at Lincoln International Hospital provided exceptional care during my treatment. The billing process was transparent and hassle-free.' },
  { name: 'Pooja Basnet', text: 'I had a wonderful experience here. The online patient system made scheduling appointments and checking my records incredibly easy. Highly recommended!' },
  { name: 'Asha Bhusal', text: 'From admission to discharge, everything was well-managed. The HPBS system kept me informed at every step. Thank you, Lincoln Hospital, for your outstanding service.' },
];

function CountUp({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 2000;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          setCount(Math.floor(progress * end));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function LandingPage() {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setCurrentPhoto(p => (p + 1) % photos.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentTestimonial(t => (t + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-lg">L</div>
            <div>
              <p className="font-bold text-sm leading-tight">Lincoln International</p>
              <p className="text-[10px] text-gray-400 leading-tight">Hospital</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <span className="flex items-center gap-1">📞 +977-1-4234567</span>
          </div>
          <Link to="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
            Staff Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-400/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(59,130,246,0.08) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              Trusted Healthcare Since 2005
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Lincoln<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">International</span><br />
              Hospital
            </h1>
            <p className="text-lg text-blue-400 font-medium">Hospital Patient & Billing System (HPBS)</p>
            <p className="text-gray-400 max-w-md leading-relaxed">
              A comprehensive digital healthcare platform streamlining patient management, 
              billing, and medical services for a smarter, connected hospital experience.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              📍 Dhobidhara, Kathmandu, Nepal
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5">
                Get Started
              </Link>
              <Link to="/login" className="px-6 py-3 border border-white/20 hover:border-white/40 rounded-xl font-medium transition-all duration-300 hover:bg-white/5">
                Patient Portal
              </Link>
            </div>
          </div>

          {/* Photo Slideshow */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm aspect-[4/3]">
              {photos.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={'Hospital ' + (i + 1)}
                  className={'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ' + (i === currentPhoto ? 'opacity-100' : 'opacity-0')}
                />
              ))}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    className={'w-2 h-2 rounded-full transition-all duration-300 ' + (i === currentPhoto ? 'bg-blue-400 w-6' : 'bg-white/30 hover:bg-white/50')}
                  />
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-600/20 rounded-2xl blur-xl" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-400/15 rounded-2xl blur-xl" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 15, suffix: '+', label: 'Departments' },
            { value: 50, suffix: '+', label: 'Doctors' },
            { value: 10000, suffix: '+', label: 'Patients Served' },
            { value: 24, suffix: '/7', label: 'Service Hours' },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Facility</span></h2>
            <p className="text-gray-400 max-w-lg mx-auto">Take a virtual tour of our world-class hospital infrastructure and modern amenities.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((src, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-white/5 hover:border-blue-500/30 transition-all duration-500"
              >
                <img src={src} alt={'Gallery ' + (i + 1)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-sm font-medium">View Photo</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-3xl text-white/60 hover:text-white transition-colors">✕</button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length); }} className="absolute left-4 text-4xl text-white/40 hover:text-white">‹</button>
          <img src={photos[lightbox]} alt="Gallery" className="max-w-4xl max-h-[85vh] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length); }} className="absolute right-4 text-4xl text-white/40 hover:text-white">›</button>
        </div>
      )}

      {/* Services */}
      <section className="py-20 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Services</span></h2>
            <p className="text-gray-400 max-w-lg mx-auto">Comprehensive healthcare services delivered with compassion and clinical excellence.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.06] transition-all duration-300 group cursor-pointer">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Patients Say</span></h2>
          </div>
          <div className="relative min-h-[200px]">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={'absolute inset-0 transition-all duration-700 ' + (i === currentTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none')}
              >
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                  <div className="text-blue-400 text-4xl mb-4">"</div>
                  <p className="text-gray-300 leading-relaxed mb-6 italic">{t.text}</p>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-gray-500">Verified Patient</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={'h-2 rounded-full transition-all duration-300 ' + (i === currentTestimonial ? 'bg-blue-500 w-8' : 'bg-white/20 w-2 hover:bg-white/40')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 blur-[80px] rounded-full" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative">Ready to Experience <span className="text-blue-400">Better Healthcare?</span></h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto relative">Join thousands of patients who trust Lincoln International Hospital for their healthcare needs.</p>
            <div className="flex flex-wrap justify-center gap-4 relative">
              <Link to="/register" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5">
                Register Now
              </Link>
              <a href="tel:+977-1-4234567" className="px-8 py-3 border border-white/20 hover:border-white/40 rounded-xl font-medium transition-all duration-300 hover:bg-white/5">
                📞 Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold">L</div>
                <div>
                  <p className="font-bold text-sm">Lincoln International</p>
                  <p className="text-[10px] text-gray-500">Hospital</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Providing compassionate, world-class healthcare to the community since 2005.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Quick Links</h4>
              <div className="space-y-2">
                {['About Us', 'Departments', 'Doctors', 'Appointments'].map((link) => (
                  <p key={link} className="text-sm text-gray-500 hover:text-blue-400 cursor-pointer transition-colors">{link}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Services</h4>
              <div className="space-y-2">
                {['Emergency', 'Cardiology', 'Laboratory', 'Pharmacy'].map((link) => (
                  <p key={link} className="text-sm text-gray-500 hover:text-blue-400 cursor-pointer transition-colors">{link}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Contact</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <p>📍 Dhobidhara, Kathmandu, Nepal</p>
                <p>📞 +977-1-4234567</p>
                <p>✉️ info@lincolnhospital.com.np</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">© 2026 Lincoln International Hospital. All rights reserved.</p>
            <p className="text-sm text-gray-600">Hospital Patient & Billing System (HPBS)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
