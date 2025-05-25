import Vapor

func routes(_ app: Application) throws {
    app.get { req async throws -> View in
        try await req.view.render("hello", SolarSystem())
    }

    app.get("hello") { req -> View in
        try await req.view.render("hello", SolarSystem())
    }
    
    app.webSocket("game") { req, ws in
        // Add the WebSocket to the connected clients
        Task {
            await WebSocketManager.shared.add(ws)
            //let message = await lettersToJSON(letters)
            print("new connection")
            print("generating initial message")
            for (key, letter) in await letters {
                print(letter)
                await WebSocketManager.shared.broadcast(message: structToJSON(letter))
            }
        }
       
       // Handle incoming messages
       ws.onText { ws, text in
           // Broadcast the received message to all connected clients
           Task {
               if let letter: Letter = JSONToStruct(text) {
                   if #available(macOS 15.0, *) {
                       Task { @MainActor in letters[letter.index] = letter }
                       await WebSocketManager.shared.broadcast(message: structToJSON(letter))
                   } else {
                       // Fallback on earlier versions
                   }
               } else {
                   print("could not convert: \(text)")
               }
//               await WebSocketManager.shared.broadcast(message: text)
           }
       }
       
       // Remove the WebSocket when the connection is closed
       ws.onClose.whenComplete { _ in
           Task {
               await WebSocketManager.shared.remove(ws)
               await save(data: letters, to: savePath)
           }
       }
    }
    
}

struct SolarSystem: Encodable {
    let planets = ["Venus", "Earth", "Mars"]
    
}


@MainActor
class WebSocketManager {
    static let shared = WebSocketManager()
    private var clients: [WebSocket] = []

    func add(_ ws: WebSocket) {
        clients.append(ws)
    }

    func remove(_ ws: WebSocket) {
        clients.removeAll { $0 === ws }
    }

    func broadcast(message: String) {
        print("broadcasting message: \(message)")
        for client in clients {
            client.send(message)
        }
    }
}
