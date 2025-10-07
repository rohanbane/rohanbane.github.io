// main.js — loads JSON data and wires interactions
const paths = {
  about: 'assets/data/about.json',
  skills: 'assets/data/skills.json',
  experience: 'assets/data/experience.json',
  projects: 'assets/data/projects.json'
};

document.addEventListener('DOMContentLoaded', init);

async function init(){
  await Promise.all([
    loadAbout(),
    loadSkills(),
    loadExperience(),
    loadProjects()
  ]);
  setupTheme();
  setupResumeLink();
  setupLetsTalk();
  setupClearSkills();
  setupProjectSearch();
}

/* ========== ABOUT ========== */
async function loadAbout(){
  const res = await fetch(paths.about);
  const json = await res.json();
  document.getElementById('name').textContent = json.name;
  document.getElementById('title').textContent = json.role;
  document.getElementById('aboutText').textContent = json.bio;
  document.getElementById('avatar').src = json.avatar || 'assets/images/avatar.jpg';
  document.getElementById('emailLink').textContent = json.email;
  document.getElementById('emailLink').href = `mailto:${json.email}`;
  document.getElementById('phone').textContent = json.phone || '';
  document.getElementById('linkedin').href = json.linkedin || '#';
  document.getElementById('github').href = json.github || '#';
  document.getElementById('portfolioLink').href = json.portfolio || '#';
  document.getElementById('expYears').textContent = json.experience_years || '—';
  document.getElementById('projectsCount').textContent = json.projects_count || '—';
}

/* ========== SKILLS ========== */
let activeSkillFilter = null;
async function loadSkills(){
  const res = await fetch(paths.skills);
  const json = await res.json();
  const container = document.getElementById('skillsContainer');
  container.innerHTML = '';
  json.skills.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = s.name;
    btn.dataset.skill = s.name;
    btn.addEventListener('click', () => toggleSkillFilter(s.name, btn));
    container.appendChild(btn);
  });
  // also create project filters
  const projectFilters = document.getElementById('projectFilters');
  projectFilters.innerHTML = '';
  json.skills.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'chip small';
    chip.textContent = s.name;
    chip.dataset.skill = s.name;
    chip.addEventListener('click', () => toggleSkillFilter(s.name, chip));
    projectFilters.appendChild(chip);
  });
}
function toggleSkillFilter(skill, btn){
  // clear previous active
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  if(activeSkillFilter === skill){
    activeSkillFilter = null;
    filterProjects();
    return;
  }
  activeSkillFilter = skill;
  btn.classList.add('active');
  filterProjects();
}
function setupClearSkills(){
  document.getElementById('clearSkills').addEventListener('click', () => {
    activeSkillFilter = null;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    filterProjects();
  });
}

/* ========== EXPERIENCE ========== */
async function loadExperience(){
  const res = await fetch(paths.experience);
  const json = await res.json();
  const container = document.getElementById('experienceContainer');
  container.innerHTML = '';
  json.experience.forEach(e => {
    const el = document.createElement('div');
    el.className = 'exp-item';
    el.innerHTML = `
      <h4>${e.role} — <small>${e.company}</small></h4>
      <p class="muted">${e.period} • ${e.location || ''}</p>
      <p>${e.summary || ''}</p>
      <div class="more">${(e.details || []).map(d=>`<li>${d}</li>`).join('')}</div>
      <button class="link toggleMore">Show more</button>
    `;
    el.querySelector('.toggleMore').addEventListener('click', () => {
      el.classList.toggle('open');
      el.querySelector('.toggleMore').textContent = el.classList.contains('open') ? 'Show less' : 'Show more';
    });
    container.appendChild(el);
  });
}

/* ========== PROJECTS ========== */
let allProjects = [];
async function loadProjects(){
  const res = await fetch(paths.projects);
  const json = await res.json();
  allProjects = json.projects;
  renderProjects(allProjects);
}
function renderProjects(list){
  const container = document.getElementById('projectsContainer');
  container.innerHTML = '';
  if(list.length === 0){
    container.innerHTML = '<p>No projects found.</p>';
    return;
  }
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <h4>${p.title}</h4>
      <p class="muted">${p.description}</p>
      <div class="project-tech">${(p.tech || []).map(t=>`<span class="chip small" data-skill="${t}">${t}</span>`).join('')}</div>
      <div style="margin-top:10px">
        ${p.demo ? `<a class="link" href="${p.demo}" target="_blank">Live</a>` : ''}
        ${p.repo ? `<a class="link" href="${p.repo}" target="_blank" style="margin-left:8px">Code</a>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
  // clicking chips inside projects apply filter
  container.querySelectorAll('.chip.small').forEach(c=>{
    c.addEventListener('click', () => {
      const skill = c.dataset.skill;
      document.querySelectorAll('.chip').forEach(x => {
        if(x.dataset.skill === skill) x.classList.add('active');
        else x.classList.remove('active');
      });
      activeSkillFilter = skill;
      filterProjects();
    });
  });
}
function filterProjects(){
  if(!activeSkillFilter){
    renderProjects(allProjects);
    return;
  }
  const filtered = allProjects.filter(p => (p.tech || []).includes(activeSkillFilter));
  renderProjects(filtered);
}
function setupProjectSearch(){
  const el = document.getElementById('projectSearch');
  el.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = allProjects.filter(p => {
      return p.title.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q) || (p.tech||[]).some(t=>t.toLowerCase().includes(q));
    });
    renderProjects(filtered);
  });
}

/* ========== THEME / RESUME / CONTACT ========== */
function setupTheme(){
  const toggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', current === 'dark' ? 'dark' : 'light');
  toggle.textContent = current === 'dark' ? '☀️' : '🌙';
  toggle.addEventListener('click', () => {
    const now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', now === 'dark' ? 'dark' : 'light');
    localStorage.setItem('theme', now);
    toggle.textContent = now === 'dark' ? '☀️' : '🌙';
  });
}
function setupResumeLink(){
  // If you want to update resume path dynamically, the about.json can contain resume
  // otherwise link is already set in index.html to assets/RohanBane_Resume.pdf
}
function setupLetsTalk(){
  document.getElementById('letsTalk').addEventListener('click', () => {
    const email = document.getElementById('emailLink').textContent;
    window.location.href = `mailto:${email}?subject=Hi%20Rohan%20—%20Let's%20talk`;
  });
}
