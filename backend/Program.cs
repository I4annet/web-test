using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;
using WarungApi.Data;
using WarungApi.Middleware;
using WarungApi.Repositories;
using WarungApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Initialize Serilog configuration
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Configure Services
builder.Services.AddControllers();

// Configure EF Core with PostgreSQL
builder.Services.AddDbContext<WarungDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Dependency Injections
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Configure JWT Authentication
var tokenKey = builder.Configuration["Jwt:Key"] ?? "SuperSecretKeyForTokoWarung2026SecureLongString";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "WarungApi",
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "WarungWebAndMobile",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Configure CORS for web frontend integration
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .AllowAnyOrigin();
    });
});

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Toko Warung RESTful API", 
        Version = "v1",
        Description = "API endpoints for User Authentication, Product Management, and Checkout Systems."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer [space] token' in the input field.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// Configure middleware pipeline
if (app.Environment.IsDevelopment() || true) // Enable swagger for easier testing
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Toko Warung API v1");
        c.RoutePrefix = string.Empty; // Serve Swagger at app root (e.g. http://localhost:5000/)
    });
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure DB is created and seeded on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var context = services.GetRequiredService<WarungDbContext>();
    
    int maxRetries = 10;
    int delayMs = 3000;
    for (int i = 1; i <= maxRetries; i++)
    {
        try
        {
            logger.LogInformation("Attempting to connect and seed database (Attempt {Attempt}/{MaxRetries})...", i, maxRetries);
            context.Database.EnsureCreated();
            DbSeeder.Seed(context);
            logger.LogInformation("Database created and seeded successfully.");
            break;
        }
        catch (Exception ex)
        {
            logger.LogWarning("Attempt {Attempt} failed to initialize database: {Message}", i, ex.Message);
            if (i == maxRetries)
            {
                logger.LogError(ex, "Error creating or seeding database after maximum retries.");
            }
            else
            {
                Thread.Sleep(delayMs);
            }
        }
    }
}

var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Run($"http://0.0.0.0:{port}");
