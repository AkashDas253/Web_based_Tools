document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('directory-container');
    const searchInput = document.getElementById('search-input');
    
    let directoryData = null;

    try {
        const response = await fetch('directory.json');
        if (!response.ok) throw new Error('Failed to load directory configuration.');
        directoryData = await response.json();
        renderDirectory(directoryData);
    } catch (error) {
        container.innerHTML = `<p style="color: #f87171; text-align: center;">Error loading directory data. Make sure app.js and directory.json are hosted properly.</p>`;
        console.error(error);
        return;
    }

    // Render the nested structure
    function renderDirectory(data) {
        container.innerHTML = '';

        data.categories.forEach(category => {
            const categorySection = document.createElement('section');
            categorySection.className = 'category-section';
            categorySection.dataset.categoryId = category.id;

            const catTitle = document.createElement('h2');
            catTitle.className = 'category-title';
            catTitle.textContent = category.title;
            categorySection.appendChild(catTitle);

            category.subcategories.forEach(sub => {
                const subWrapper = document.createElement('div');
                subWrapper.className = 'subcategory-group';

                const subTitle = document.createElement('h3');
                subTitle.className = 'subcategory-title';
                subTitle.textContent = sub.title;
                subWrapper.appendChild(subTitle);

                const grid = document.createElement('ul');
                grid.className = 'grid';

                sub.items.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'card';
                    li.dataset.name = item.name.toLowerCase();
                    li.dataset.desc = (item.description || '').toLowerCase();

                    const linkPath = item.link || `${item.path}/index.html`;

                    li.innerHTML = `
                        <a href="${linkPath}">
                            <div class="card-title">${item.name}</div>
                            ${item.description ? `<div class="card-desc">${item.description}</div>` : ''}
                            <div class="card-path">${item.path}</div>
                        </a>
                    `;
                    grid.appendChild(li);
                });

                subWrapper.appendChild(grid);
                categorySection.appendChild(subWrapper);
            });

            container.appendChild(categorySection);
        });
    }

    // Real-time search filter
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = container.querySelectorAll('.card');

        cards.forEach(card => {
            const name = card.dataset.name;
            const desc = card.dataset.desc;
            if (name.includes(query) || desc.includes(query)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        // Hide subcategories and categories if all their children are hidden
        const categories = container.querySelectorAll('.category-section');
        categories.forEach(cat => {
            const subcategories = cat.querySelectorAll('.subcategory-group');
            let hasVisibleCategory = false;

            subcategories.forEach(sub => {
                const subCards = sub.querySelectorAll('.card');
                const visibleSubCards = Array.from(subCards).some(c => !c.classList.contains('hidden'));
                
                if (visibleSubCards) {
                    sub.classList.remove('hidden');
                    hasVisibleCategory = true;
                } else {
                    sub.classList.add('hidden');
                }
            });

            if (hasVisibleCategory) {
                cat.classList.remove('hidden');
            } else {
                cat.classList.add('hidden');
            }
        });
    });
});