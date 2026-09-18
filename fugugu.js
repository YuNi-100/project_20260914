function fugugu(){
    for (let dan = 2; dan < 10; dan++) {
        console.log(dan + "단") 
        for (let i=1; i<10; i++)
            console.log( dan + " * " + i + " = " + dan*i)
        console.log("===")
    }
}

function fugugu2(dan){
    console.log(dan + "단")
    for (let i=1; i<10; i++){
            console.log( dan + " * " + i + " = " + dan*i)
}
        console.log("===")
        return "성공"
    }
    
function dollar(usd){
    const exchangeRate = 1350;
    
    for (let i = 1; i <= 9; i++) {
        let totalUsd = usd * i;
        let krw = totalUsd * exchangeRate;

        console.log(`$${totalUsd} = ${krw.toLocaleString()}원`);
    }
    console.log("===");
}

