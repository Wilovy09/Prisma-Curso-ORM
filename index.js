import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(){
   // // Crear Usuario
   const newUser = await prisma.user.create({
    data:{
        name: "Jorge",
        email: "jorgee@gmail.com"
    }
   })
    console.log(newUser)

    const newPost = await prisma.post.create({
        data:{
            title: "Mi primer post",
            content: "Este es mi primer post",
            author:{
                connect:{
                    id: newUser.id
                }
            }
        }
    })
    console.log(newPost)
}

main()