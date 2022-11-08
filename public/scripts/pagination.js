// Pagination

if(document.querySelector('#countCourses')){

    function nextAndPrevButtons(num){
        let prevPage = document.querySelector('#prevPage');
        let nextPage = document.querySelector('#nextPage');
        let search = document.querySelector('input[name="courseName"]');
        let countCourses = document.querySelector('#countCourses');
        let pages = Math.ceil(+countCourses.innerHTML / 5);
        let buttons = document.querySelectorAll('button[onclick="addToCart(this)"]');
        let prices = document.querySelectorAll('.pr');
        let pageNum = num;

        if(pages && prevPage && nextPage){
            pages > pageNum ? nextPage.classList.remove('d-none') :
                            nextPage.classList.add('d-none');
        
            pageNum > 1  ?  prevPage.classList.remove('d-none') :
                            prevPage.classList.add('d-none');

            if(!userId){
                buttons.forEach(button => button.remove())
            }else{
                prices.forEach(pr => {
                    pr.classList.add('float-right')
                })
            }
        
        
            nextPage.addEventListener('click', () => {
                let body = nextPage.closest('.container');
                let csrf = body.dataset.csrf;
                pageNum++
        
                fetch(`/courses/page?number=${pageNum}&search=${search.value}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'X-XSRF-TOKEN': csrf
                    },
                    body: JSON.stringify({ _csrf: csrf })
                })
                    .then(res => res.json())
                    .then(result => {
                        return showCountCoursesInCurrentPage(result)
                    })
                    .then(courses => {
                        body.innerHTML = courses.join(' ') + 
                        `
                            <ul class="pagination d-flex justify-content-center">
                                <button class="btn btn-primary d-none font-weight-bold" id="prevPage" title="Previous Page"><<</button>
                                <button class="btn btn-primary ml-1 d-none font-weight-bold" id="nextPage" title="Next Page">>></button>
                            </ul>
                        `;

                        nextAndPrevButtons(pageNum);
                    })
            })

  
            prevPage.addEventListener('click', () => {
                let body = prevPage.closest('.container');
                let csrf = body.dataset.csrf;
                pageNum--
        
                fetch(`/courses/page?number=${pageNum}&search=${search.value}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'X-XSRF-TOKEN': csrf
                    },
                    body: JSON.stringify({ _csrf: csrf })
                })
                    .then(res => res.json())
                    .then(result => {
                        return showCountCoursesInCurrentPage(result)
                    })
                    .then(courses => {
                        body.innerHTML = courses.join(' ') + 
                        `
                            <ul class="pagination d-flex justify-content-center">
                                <button class="btn btn-primary d-none font-weight-bold" id="prevPage" title="Previous Page"><<</button>
                                <button class="btn btn-primary ml-1 d-none font-weight-bold" id="nextPage" title="Next Page">>></button>
                            </ul>
                        `;

                        nextAndPrevButtons(pageNum);
                    })
            })
        
        }   
    }
    nextAndPrevButtons(1);
}