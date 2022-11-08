"use strict"


let tbody = document.querySelector('tbody');
let price = document.querySelectorAll('.price');
let date = document.querySelectorAll('.date');
let spinnerPage = document.querySelector('.spinnerPage');
let cont = document.querySelector('.content');
let userId = document.querySelector('#userId');
let pId = document.querySelector('#pId');
let message = document.querySelector('#message');
let send_message = document.querySelector('#send_message');
let chat = document.querySelector('#chat');
let connect = document.querySelector('#connect');
let checkout = document.querySelector('#checkout');
let stripe = Stripe('pk_test_51HQYwUGgtit1tIvZIsMcgab1RE2BWlN6M6g2QCQugzn1VdRZADa8401ksG0iwHLr3VXytxgInQcTwa4gs1OiFjgG00ujFLSIOt');
let socket = io();


document.addEventListener('DOMContentLoaded', () => {
    spinnerPage.style.display = 'none';
    cont.classList.remove('d-none');
})

if(pId){
    if(!pId.value){
        message.setAttribute('disabled', '');
    }
}

if(checkout){
    checkout.addEventListener('click', function(){
        let parent = this.closest('.userCart');
        let csrf = parent.dataset.csrf;

        fetch('/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': csrf
            },
            body: JSON.stringify({ _csrf: csrf})
        })
        .then(res => res.json())
        .then(session => {
            return stripe.redirectToCheckout({sessionId: session.id})
        })
        .then(result => {
            if(result.error){
                alert(result.error.message)
            }
        })
        .catch(err => {
            console.error(err);
        })
    })
}


if(chat){
    let chatMessages = chat.querySelectorAll('div p');
    let cardMessage = chat.querySelectorAll('#chat .d-flex');

    chatMessages.forEach(sms => {
        let btn = document.createElement('button');
        btn.classList = "btn white fa fa-trash text-secondary";
        btn.setAttribute('onclick', "deleteMessage(this)");

        if(sms.id === userId.value){
            sms.closest('div').style.cssText = 'display:flex; justify-content:flex-end;';
            sms.style.cssText = 'background:lightgreen;';
            sms.closest('div').prepend(btn);
        }else{
            sms.closest('div').style.cssText = 'display:flex; justify-content:flex-start;';
            sms.style.cssText = 'background:lightgrey;'
            sms.closest('div').append(btn);
        }
    })


    if(cardMessage.length){
        cardMessage.forEach(item => {
            item.addEventListener('mouseover', () => {
                let btn = item.querySelector('button.btn');
                btn.style.cssText = 'display:block';
            })

            item.addEventListener('mouseout', () => {
                let btn = item.querySelector('button.btn');
                btn.style.cssText = 'display:none';
            })
        })
    }
}


if(send_message){
    setInterval(() => {
        if(message.value.trim().length){
            send_message.classList.remove('disabled');
        }else{
            send_message.classList.add('disabled');
        }
    }, 1000)
    

    send_message.onclick = () => {
        socket.emit('send_message', { 
                chatId: chat.dataset.id, 
                message: message.value, 
                userId: userId.value, 
                date: new Date() 
        });
        
        message.value = ''; 
    }
}


socket.on('send_message', data => {
    let div = document.createElement('div');
    let p = document.createElement('p');
    let btn = document.createElement('button');
    div.classList = 'd-flex align-items-center';
    btn.classList = 'btn white fa fa-trash text-secondary';
    p.classList = 'message';

    p.innerHTML = `${data.message}<br>
        <span class="message_date d-block float-right">${messageDateFormat(data.date)}</span>
    `;
    p.setAttribute('id', data.userId);
    btn.setAttribute('onclick', 'deleteMessage(this)');
    div.setAttribute('data-id', data.messageID);

    if(userId.value === data.userId){
        div.style.cssText = 'display:flex; justify-content:flex-end';
        p.style.cssText = `
            background:lightgreen; 
            padding: 10px; width: auto; 
            padding:10px; border-radius: 7px;`;

        div.append(btn);
        div.append(p);
    }else{
        div.style.cssText = 'display:flex; justify-content:flex-start;';
        p.style.cssText = `
            background:lightgrey; 
            padding: 10px; width: auto; 
            padding:10px; border-radius: 7px;`;

        div.append(p);
        div.append(btn)
    }

    chat.append(div);

    let cardMessage = chat.querySelectorAll('#chat .d-flex');

    if(cardMessage.length){
        cardMessage.forEach(item => {
            item.addEventListener('mouseover', () => {
                let btn = item.querySelector('button.btn');
                btn.style.cssText = 'display:block';
            })

            item.addEventListener('mouseout', () => {
                let btn = item.querySelector('button.btn');
                btn.style.cssText = 'display:none';
            })
        })
    }
})



// Format Number

function numberFormat(num){
    return Intl.NumberFormat('en',{
        currency:'usd',
        style:'currency'
    }).format(num);
}


if(price.length){
    price.forEach(p => {
        p.innerHTML =  numberFormat(p.textContent);
    })
}


// DateTime Format

function dateFormat(date){
    return Intl.DateTimeFormat('en',{
        year:'numeric',
        month:'long',
        day:'2-digit',
        hour:'2-digit',
        minute:'2-digit',
        second:'2-digit',
    }).format(new Date(date));
}

if(date){
    date.forEach(t => {
        t.innerHTML = dateFormat(t.textContent);
    })
}


function messageDateFormat(date){
    return Intl.DateTimeFormat('en',{
        year:'numeric',
        month:'short',
        day:'2-digit',
        hour:'2-digit',
        minute:'2-digit',
        second:'2-digit',
        hour12: false
    }).format(new Date(date));
}

let messageDate = document.querySelectorAll('.chatroom .container .message .message_date');
messageDate.forEach(item => item.innerHTML = messageDateFormat(item.textContent))



// removeMyCourse

function removeMyCourse(button){
    if(confirm('Do you want to remove this course?')){
        let card = button.closest('.card');
        let id = card.id;
        let csrf = card.dataset.csrf;
        let json = JSON.stringify({
            _csrf:csrf
        })


        fetch(`/myaccount/remove/${id}`,{
            method:'DELETE',
            headers:{
                'X-XSRF-TOKEN':csrf
            },
            body:json
        })
          .then(() => {
              let mycourses = document.querySelector('.mycourses');
              if(!mycourses.childElementCount){
                mycourses.innerHTML = '<h6 class="text-center text-danger">No Courses</h6>'
              }
          });
        
        card.remove();
    }
}


// addToCart

function addToCart(button){
    let card = button.closest('.card');
    let id = card.id;
    let csrf = card.closest('.courses').dataset.csrf;
    let json = JSON.stringify({
        _csrf:csrf
    })

    fetch(`/cart/add/${id}`, {
        method:'POST',
        headers:{
            'X-XSRF-TOKEN':csrf
        },
        body:json
    })
        .then(res => res.text())
        .then(message => alert(message));
}


function Carts(arr, csrf){
    let price = document.querySelector('.price');
    price.innerHTML = numberFormat(arr.reduce((total,c) => total + c.count * c.courseId.price,0));

    return Promise.resolve(
        arr.map(c => {
            return c.innerHTML = 
                `<tr id='${c.courseId._id}' data-csrf='${csrf}'>
                <td>
                    <img src="${c.courseId.image}" alt="${c.courseId.title}" class="courseLogo">
                </td>
                <td>
                    <a href='/courses/${c.courseId._id}'>${c.courseId.title}</a>
                </td>
                <td>${c.count}</td>
                <td>
                    <div class="btn-group">
                            <button class="btn btn-small rounded shadow waves-effect" onclick="increaseTheAmount(this)">
                            <i class="small material-icons add">add</i>
                            </button>
                            <button class="btn btn-small orange rounded shadow ml-1 fa fa-trash" onclick="removeCourseFromCart(this)"></button>
                    </div>
                </td>
            </tr>`
        })
    )
}


// increaseTheAmount

function increaseTheAmount(button){
    let course = button.closest('tr');
    let id = course.id;
    let csrf = course.dataset.csrf;
    let json = JSON.stringify({
        _csrf:csrf
    })
    

    fetch(`/cart/amount/${id}`,{
        method:'POST',
        headers:{
            'X-XSRF-TOKEN':csrf
        },
        body:json
    })
        .then(res => res.json())
        .then(cart => Carts(cart, csrf))
        .then(result => {
            tbody.innerHTML = result.join(' ');
        });
}


//  removeCourseFromCart

function removeCourseFromCart(button){
    let course = button.closest('tr');
    let id = course.id;
    let csrf = course.dataset.csrf;
    let json = JSON.stringify({
        _csrf: csrf
    })


    fetch(`/cart/remove/${id}`, {
        method:'DELETE',
        headers:{
            'X-XSRF-TOKEN':csrf
        },
        body:json
    })
    .then(res => res.json())
    .then(cart => Carts(cart, csrf))
    .then(result => {
        if(!result.length){
            document.querySelector('.userCart').innerHTML = `
                <h5 class="text-center">Cart is empty</h5>
            `
        }else{
            tbody.innerHTML = result.join(' ');
        }
    })
}


//  remove Order

function removeOrder(button){
    if(confirm('Do you want to remove this order?')){
        let card = button.closest('.card');
        let id = card.id;
        let csrf = card.dataset.csrf;
        let json = JSON.stringify({
            _csrf:csrf
        })


        fetch(`/orders/remove/${id}`,{
            method:'DELETE',
            headers:{
                'X-XSRF-TOKEN':csrf
            },
            body:json
        })
        .then(res => res.text())
        .then(result => {
            card.remove();
            document.querySelector('.jumbotron .alert h6').innerHTML = result;
            document.querySelector('.jumbotron .alert').classList.remove('invisible');

            setTimeout(() => {
                document.querySelector('.jumbotron .alert h6').innerHTML = '';
                document.querySelector('.jumbotron .alert').classList.add('invisible');
            }, 4000)
        })
        .then(() => {
            let cards = document.querySelectorAll('.card');
            if(!cards.length){
                document.querySelector('.allOrders').innerHTML = `
                    <h5 class="text-center">No Orders</h5>
                `;
            }
        })
        .catch(err => {
            console.error(err);
        })
    }
}




// Open Context Menu

let cards = document.querySelectorAll('.chats .container a');
let userID = document.querySelector('.chats .container #userId');

if(cards){
    cards.forEach(card => {
        card.oncontextmenu = function(event){
            event.preventDefault();
            let csrf = card.dataset.csrf;

            if(confirm('Do you want remove this chat ?')){
                fetch(`/chats/${card.dataset.id}`, {
                     method: 'POST',
                     headers:{
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': csrf
                     },
                     body: JSON.stringify({
                        userId: userID.value,
                        _csrf: csrf
                     })
                })
                .then(() => {
                    card.remove();
                    let cards = document.querySelectorAll('.chats .container a');

                    if(!cards.length){
                        let chat = document.querySelector('.chats .container');
                        let h5 = document.createElement('h5');
                        h5.classList = 'text-center';
                        h5.innerHTML = 'No messages';
                        chat.append(h5);
                    }
                });
            }
        }
    })
}




// Delete Message

function deleteMessage(button){
    let parent = button.closest('.d-flex');
    let messageID = parent.dataset.id;

    socket.emit('delete_message', {chatId: chat.dataset.id, messageID});

    socket.on('delete_message', data => {
        parent.remove();
    })
}



// Function Show Count Courses in Current Page

function showCountCoursesInCurrentPage(arr){
    document.querySelector('input[name="search"]').value = arr.searchCourseName;
    
    return Promise.resolve(
        arr['allcourses'].map(c => {
            return c.innerHTML = `
                <div class="card mx-auto border shadow" id="${c.course._id}">
                    <div class="card-header">
                        <img src="${c.course.image}" alt="${c.course.title}">
                    
                        <h6 class="float-right mr-3">
                            Course by 
                            <a href="/account/${c.user._id}">${c.user.firstname} ${c.user.lastname}</a>
                        </h6> 

                    </div>
                    <div class="card-body">
                        <h4 class="card-title text-center">
                            <a href="/courses/${c.course._id}">${c.course.title}</a>
                        </h4>
                        <button class="btn green waves-effect shadow d-flex float-left" onclick="addToCart(this)">
                            <i class="material-icons add_shopping_cart">add_shopping_cart</i>
                            <span>&nbsp;Add</span>
                        </button>

                        <p class="float-left pr">Price:
                            <strong class="price">${numberFormat(c.course.price)}</strong>
                        </p>
                    </div>
                </div>`
        })
    )
}



// Function isAuthenticated

function isAuthenticated(){
    
    const userId = document.querySelector('#userId');
    
    if(!userId){
        buttons.forEach(button => {
            button.classList.remove();
        })
    }
}


// Scroll Top

document.addEventListener('scroll', () => {
    if(window.pageYOffset > window.innerHeight){
        $('#scrollTop').css('visibility', 'visible')
    }else{
        $('#scrollTop').css('visibility', 'hidden')
    }
})


if($('#scrollTop')[0]){
    $('#scrollTop').click(function(){
        $('html, body').animate({
            scrollTop: 0
        }, 'slow')
    })
}


let elems = document.querySelectorAll('.sidenav');
if(elems.length){
    M.Sidenav.init(elems);
}
