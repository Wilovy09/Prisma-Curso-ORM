# Notas que hago mientras veo el tutorial

Lo subi con PostgreSQL de SUPABASE, pero puede ser cualquier base de datos

## Crear proyecto

### Instalacion

```sh
# Es un modulo que queremos en desarrollo, pero este instala un modulo mas que es el que se usa en produccion
npm install prisma -D
```

### Inicializar Prisma

```sh
# Por defecto trabaja con PostgreSQL
#                Esto es para cambiar desde el inicio la base de datos que usaremos (en este caso es SQLITE)
npx prisma init --datasource-provider sqlite
```

### Migraciones

`migrate dev` es cuando hacemos cambios como `Age: String` a `Age: Int`

```sh
npx prisma migrate dev

# O

npx prisma migrate deploy
```

### Crear models

```prisma
// prisma/schema.prisma

// Aqui lo que estamos diciendo es:

// Crea una tabla llamada Post
model Post {
  // Que contenga un ID de tipo Entero y que por defecto se incremente solo (0,1,2,3,...)
  id Int @id @default(autoincrement())
  
  // Que tenga un Title tipo String
  title String
  
  // Que tenga un Content de tipo String
  content String
  
  // Y que contenga un AuthorID de tipo Entero
  authorID Int
}
```

## Datos y metodos

### ID

Para hacer que un elemento sea un id se usa `@id`, tambien podemos hacer que un dato tenga un valor por defecto usando `@default()`, dentro de `()` hay que poner el metodo que usaramos para asignar el valor por defecto

```prisma
model User{
  id Int @id @default(autoincrement())
  email String @unique
  name String
  lastname String?
  active Boolean @default(true)
}
```

### Todos los tados son requeridos

Todos los datos son requeridos por defecto a menos que uses un `?` al finalizar

```prisma
model User{
  //...
  lastname String?
}
```

### Datos unicos

Para datos unicos hay que usar `@unique`, asi el dato no se repetira en la tabla

```prisma
model User{
  //...
  email String @unique
}
```

### Crear datos

Para crear datos en la base de datos hay que hacerlo desde un archivo `JS`, esto es la base de todos los ejemplos que dare

```js
// importamod PrismaClient, es lo que nos permite hacer consultas de fomra sencilla
import { PrismaClient } from "@prisma/client";

// Generamos una instancia de Prismaclient y la guardamos en una constante, puede tener cualquier nombre
const prisma = new PrismaClient();

// Creamos una funcion async en la que haremos la peticion
async function main(){
    /* 
     *  Creamos una constante donde igualamos a:
     *  Nuesta instancia de prisma + la tabla que creamos + lo que queremos hacer
     *  En este caso prisma.user.create
     */ 
    const newUser = await prisma.user.create({
        /* Esto recibe un dato llamado data
         * que es igual a un objeto donde pondremos los valores de nuestra tabla
         * en este caso usaremos name, email, lastname(este es opcional) 
         * y el id se genera automaticamente
        */
        data: {
            name: "Wilovy",
            email: "wilovy@gmail.com",
        }
    })
    // hacemos un console.log de nuestra variable igualada a nuesta prisma.user.create()
    console.log(newUser);
}
// ejecutamos la funcion
main()
```

```sh
node index.js

#    CONSOLA
# $ node index.js
# { id: 1, email: 'wilovy@gmail.com', name: 'Wilovy', lastname: null }
```

### Consultar todos los datos de una Tabla

Para lograr esto tenemos que usar el metodo `.findMany()`

```js
// Esto regresa un Array de JS, en automatico
const users = await prisma.user.findMany()
// mostramos todos los datos en consola
console.log(users);

// como ya regresa un array podemos hacer de todo
users.map(user => {
    console.log(`${user.id} - ${user.name}`);
})
```

### Consultar un dato en especifico

Para consultar un dato en especifico podemos usar `.findFirst()`

```js
const user = await prisma.user.findFirst({
    where: {
        // // Esto encuentra el elemento con ID = 3
        // id: 3

            // // Esto es distinto a buscar "midudev" porque si distingue entre mayusculas y minusculas
        // name: "Midudev"

            // // Puedes hacer que busque mas de 1 parametro, basicamente es un AND, que cumpla con 1 y con el otro
        // id: 3,
        // email: "midudev@gmail.com"
         
            // // Puedes hacer que busque mas de 1 parametro, pero que sea OR, que cumpla con 1 o con el otro, devuelve el primero que encuentre
            OR: [
            {id: 1},
            {email: "midudev@gmail.com"}
            ]
    }
})
console.log(user);
```

### Eliminar un dato

Para eliminar un dato hay que usar `.delete()`

```js
// // Eliminar un dato
const user = await prisma.user.delete({
    where:{
        // // Aqui puedes poner el id o el dato por el que quieres eliminar
        id: 2
    }
})
// // Una vez que lo elimina, te devuelve el dato que acaba de eliminar
console.log(user);

// ----------------------------------------- //

// // Tambien puedes manejar el error cuando no encuentra el dato que quieres eliminar
try{
    const user = await prisma.user.delete({
        where:{
            id: 3
        }
    })
    console.log(user);
}
catch(error){
    console.log("----- No se ha encontrado el dato -----");
    console.log(error.message);
}
// NOTA: Aqui tambien es valido AND, OR, NOT para eliminar datos
```

Tambien puedes usar `.deleteMany()`, para borrar filas que tengan un dato identico

```js
const result = await prisma.user.deleteMany({
    where:{
        name: "Wilovy"
    }
})
console.log(result)
```

### Actualizar datos

Para actualizar un dato hay que usar `.update()`

```js
const updatedUser = await prisma.user.update({
    where:{
        // Tiene que ser un campo unico, en este caso id o email
        id: 5
    },
    data:{
        // Los campos que se quieren actualizar
        lastname: "Angel"
    }
})
console.log(updatedUser);
```

Pero para usar un dato que tengan en comun todos hay que usar `.updateMany()`

```js
const result = await prisma.user.updateMany({
    where:{
        // // Puede ser un dato NO unico
        name: "Wilovy"
    },
    data:{
        lastname: "Perez"
    }
})
console.log(result)
```

```sh
# CONSOLE
$ { count: 2}
# Eso quiere decir que 2 filas fueron afectadas
```

### UPSERT

Combina  `create`  y  `update` , si no existe lo crea, si existe lo actualiza.

```js
const user = await prisma.user.upsert({
    // Busca:
    where:{
        id: 5
    },
    // Si no existe crea:
    create:{
        name: "MoureDEV",
        email: "mourdeDEV@gmail.com"
    },
    // Si existe actualiza:
    update:{
        lastname: "Otis"
    }
})
console.log(user);
```

## Relacionar datos

Hay que usar el nombre de la tabla que queremos relacionarnos + `@relation(fields:[], references:[])`

La verdad, esto no se como explicarlo, pero aqui esta el [video](https://youtu.be/N5dkg28jRF0?si=ONJra-wJfcWqmj2m&t=3322) que estoy viendo

```prisma
model User {
  id Int @id @default(autoincrement())
  email String @unique
  name String
  lastname String?
  post Post[]
}

model Post {
  id Int @id @default(autoincrement())
  title String
  content String?
  authorID Int
  // User (la tabla a la que queremos relacionarnos) @relation(fields:[], references:[])
  //                   el campo que queremos relacionar de esta tabla /\       /\ el campo de la otra tabla de la que esta relacionado
  author User @relation(fields: [authorID], references: [id])
}
```

### Crear datos relacionados

```js
// // Crear Usuario
const newUser = await prisma.user.create({
data:{
    name: "Jorge",
    email: "jorgee@gmail.com"
}
})
console.log(newUser) //mostramos el usuario creado

// creamos un post            \/
const newPost = await prisma.post.create({
    data:{
        title: "Mi primer post",
        content: "Este es mi primer post",
        // Aqui esta la conexion
        author:{
            connect:{
                // nos referimos al ID del nuevo ususario creado
                id: newUser.id
            }
        }
    }
})
console.log(newPost)
```

```sh
# CONSOLA
{ id: 7, email: 'jorgee@gmail.com', name: 'Jorge', lastname: null }
{
  id: 1,
  title: 'Mi primer post',
  content: 'Este es mi primer post',
  authorID: 7
}
```

Tambien podemos usar esta otra forma

```js
const newUser = await prisma.user.create({
    data:{
        name: "Donna",
        email: "donna@gmail.com",
        // POST
        post:{
            create:{
                title: "Prisma tutorial",
                content: "Para seguir este tutorial hay que..."
            }
        }
    }
})

console.log(newUser);
const post = await prisma.post.findMany();
console.log(post);
```

## Consultar datos relacionados

```js
const users = await prisma.user.findMany({
    // esto es como decir, traeme todos los post que tiene cada usuario
    include:{
        posts: true
    }
})
console.log(users);
```

## Prisma Studio

Es un cliente que se abre en localhost, te permite ver tus tablas

### Instlacion

```sh
npm i @prisma/client
```

### Ejecutar

```sh
npx prisma studio
```
