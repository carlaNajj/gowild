import React from 'react';
import { motion } from 'framer-motion';
import { Mountain, Users, Instagram, Facebook, Twitter, Youtube, Music2 } from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useSiteSettings } from '@/lib/settings-context';

export function AboutPage() {
  const { settings } = useSiteSettings();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden flex items-center justify-center">
        <img src={settings.aboutHero.image} alt="Mountain landscape" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/70" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[#E8552A] uppercase tracking-[0.25em] text-sm font-semibold mb-4"
          >
            {settings.aboutHero.tagline}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-heading text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight"
          >
            {settings.aboutHero.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-white/80 text-lg mt-4 max-w-xl mx-auto leading-relaxed"
          >
            {settings.aboutHero.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 mx-auto bg-[#1A5A6B]/10 rounded-2xl flex items-center justify-center text-[#1A5A6B] mb-6">
              <Mountain className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              {settings.aboutMission.title}
            </h2>
            <p className="text-[#6B7280] text-lg leading-relaxed max-w-2xl mx-auto">
              {settings.aboutMission.text}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1A1A1A]">
              What We Stand For
            </h2>
            <p className="text-[#6B7280] mt-3">Values that guide every product we create</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {settings.aboutValues.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1A5A6B]/10 flex items-center justify-center text-[#1A5A6B] mb-4">
                  <DynamicIcon name={v.icon} className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-[#1A1A1A] mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {v.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-[#1A5A6B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {settings.aboutStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <p className="font-heading text-4xl md:text-5xl font-extrabold text-white">
                  {s.value}
                </p>
                <p className="text-white/70 text-sm mt-2 uppercase tracking-wider">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Brand Story */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={settings.aboutStory.image}
                alt="GoWild team on a mountain"
                className="rounded-2xl shadow-lg w-full aspect-[4/3] object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-4">
                {settings.aboutStory.title}
              </h2>
              {settings.aboutStory.paragraphs.map((para, i) => (
                <p key={i} className="text-[#6B7280] leading-relaxed mb-4">
                  {para}
                </p>
              ))}
              <div className="flex items-center gap-4 mt-6 flex-wrap">
                {settings.aboutFeatures.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <DynamicIcon name={feat.icon} className="w-5 h-5 text-[#E8552A]" />
                    <span className="text-sm font-medium text-[#1A1A1A]">{feat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Users className="w-12 h-12 text-[#1A5A6B] mx-auto mb-4" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-4">
              {settings.aboutCta.title}
            </h2>
            <p className="text-[#6B7280] leading-relaxed mb-8 max-w-xl mx-auto">
              {settings.aboutCta.subtitle}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {Object.entries(settings.socialLinks)
                .filter(([, url]) => url.trim())
                .map(([name, url]) => {
                  const iconMap: Record<string, React.ReactNode> = {
                    instagram: <Instagram className="w-4 h-4" />,
                    facebook: <Facebook className="w-4 h-4" />,
                    twitter: <Twitter className="w-4 h-4" />,
                    youtube: <Youtube className="w-4 h-4" />,
                    tiktok: <Music2 className="w-4 h-4" />,
                  };
                  return (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#1A5A6B] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#1A8DA3] transition-all hover:scale-[1.02] flex items-center gap-2"
                    >
                      {iconMap[name]}
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </a>
                  );
                })}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
