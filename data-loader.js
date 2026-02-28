/**
 * Data Loader for GitHub Pages
 * Loads project data from JSON file instead of API
 */

let projectsData = null;

async function loadProjectsData() {
  if (projectsData) return projectsData;
  
  try {
    const response = await fetch('/projects-data.json');
    if (!response.ok) throw new Error('Failed to load projects data');
    projectsData = await response.json();
    return projectsData;
  } catch (error) {
    console.error('Error loading projects data:', error);
    return null;
  }
}

// Make data accessible globally
window.projectsData = null;
window.loadProjectsData = loadProjectsData;

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
  window.projectsData = await loadProjectsData();
  // Dispatch custom event for React to pick up the data
  window.dispatchEvent(new CustomEvent('projectsDataLoaded', { detail: window.projectsData }));
});
