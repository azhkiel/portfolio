const skills = [
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg', alt: 'C++' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg', alt: 'Java' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg', alt: 'Python' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg', alt: 'Dart' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg', alt: 'PHP' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg', alt: 'JavaScript' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg', alt: 'HTML5' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg', alt: 'CSS3' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg', alt: 'Laravel' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', alt: 'React' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg', alt: 'Flutter' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', alt: 'Tailwind CSS' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/alpinejs/alpinejs-original.svg', alt: 'Alpine.js' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg', alt: 'MySQL' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg', alt: 'Git' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg', alt: 'GitHub' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg', alt: 'Docker' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg', alt: 'VS Code' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/visualstudio/visualstudio-original.svg', alt: 'Visual Studio' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/androidstudio/androidstudio-original.svg', alt: 'Android Studio' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ubuntu/ubuntu-original.svg', alt: 'Ubuntu' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg', alt: 'Figma' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/canva/canva-original.svg', alt: 'Canva' },
]

// Double array untuk loop mulus
const doubled = [...skills, ...skills]

export default function SkillsMarquee() {
  return (
    <section id="skills"
      className="bg-gray-50 py-20"
      style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">My Skills</h2>
          <p className="text-gray-600">Technologies and tools I work with</p>
        </div>

        <div className="logo-container">
          {/* Top Slider — kiri ke kanan */}
          <div className="logo-slider slider-left">
            {doubled.map((skill, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={skill.src} alt={skill.alt} className="logo-item" />
            ))}
          </div>

          {/* Bottom Slider — kanan ke kiri */}
          <div className="logo-slider slider-right">
            {doubled.map((skill, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={skill.src} alt={skill.alt} className="logo-item" />
            ))}
          </div>

          {/* Mobile Grid Fallback */}
          <div className="mobile-grid">
            {skills.map((skill, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={skill.src} alt={skill.alt} className="logo-item" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
