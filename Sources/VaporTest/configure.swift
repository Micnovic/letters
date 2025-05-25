import Vapor
import Leaf

let savePath = "/letters.txt"
@MainActor var letters: [Int : Letter] = [:]

// configures your application
public func configure(_ app: Application) async throws {
    app.http.server.configuration.hostname = "0.0.0.0"
    app.http.server.configuration.port = 1337
    // uncomment to serve files from /Public folder
     app.middleware.use(FileMiddleware(publicDirectory: app.directory.publicDirectory))
    // register routes
    app.views.use(.leaf)
    
    
    if let lettersFromFile: [Int : Letter] = await load(from: savePath) {
        await updateLetters(lettersFromFile)
    } else {
        await generateLetters()
    }
    
    
    try routes(app)
}



@MainActor func generateLetters() {
    for i in 0..<200 {
        let letter = Letter(index: i)
        letters[i] = letter
    }
}

@MainActor func updateLetters(_ newLetters: [Int : Letter]) {
    letters = newLetters
}

let cyrillicChars: [String] = [
    "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я", "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я", "😂", "😩", "😍", "😢", "😎", "🤔", "😡", "😱", "🤗", "😇", "🤩", "😤", "😴", "😳", "🤭", "😈", "🌟", "🍕", "🏖️", "🐶", "🌈", "🎉", "🍀", "🌍", "🍉", "🏔️", "🚗", "📚", "🌊", "🌙", "🦋"
]

struct Letter: Codable {
    
    var index: Int
    
    var char: String
    
    var x: Double
    
    var y: Double
    
    var color: String
    
    var rotation: Double
    
    init(index: Int) {
        self.index = index
        
        self.char = cyrillicChars.randomElement()!
        
        self.x = Double.random(in: 0...(800-50))
        
        self.y = Double.random(in: 0...(600-50))
        
        self.color = "hsl(\(Double.random(in: 0...360)), 100%, 50%)"
        
        self.rotation = Double.random(in: (-15.0)...(15.0))
    }
}
