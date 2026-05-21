const jsonPath = '/json/footer-data.json';

fetch(jsonPath)
  .then(response => response.json())
  .then(data => {
    // Company info
    document.getElementById('footer-company-name').textContent = data.company.name;
    document.getElementById('footer-tagline').textContent = data.company.tagline;
    document.getElementById('footer-copyright').textContent = data.company.copyright;
    
    // Social links
    document.getElementById('footer-social-fb').href = data.social.facebook;
    document.getElementById('footer-social-ig').href = data.social.instagram;
    document.getElementById('footer-social-li').href = data.social.linkedin;
    
    // Quick links
    const quickLinksList = document.getElementById('footer-quicklinks');
    quickLinksList.innerHTML = data.quickLinks.map(link => 
      `<li><a href="${link.url}">${link.name}</a></li>`
    ).join('');
    
    // Contact info
    document.getElementById('footer-address').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.contact.address}`;
    document.getElementById('footer-phone').innerHTML = `<i class="fas fa-phone"></i> ${data.contact.phone1}`;
    document.getElementById('footer-email').innerHTML = `<i class="fas fa-envelope"></i> ${data.contact.email}`;
  })
  .catch(error => console.error('Error loading footer data:', error));