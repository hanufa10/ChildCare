
using Daycare.Api.Identity;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Data;

public class DaycareDbContext
    : IdentityDbContext<ApplicationUser>
{
    public DaycareDbContext(
        DbContextOptions<DaycareDbContext> options)
        : base(options)
    {
    }

    public DbSet<Child> Children { get; set; } = null!;
    public DbSet<Parent> Parents { get; set; } = null!;
    public DbSet<ParentChild> ParentChildren { get; set; } = null!;
    public DbSet<Meal> Meals { get; set; } = null!;
    public DbSet<Staff> Staff { get; set; } = null!;
    public DbSet<ChildAttendance> ChildAttendances { get; set; } = null!;
    public DbSet<StaffAttendance> StaffAttendances { get; set; } = null!;
    public DbSet<Announcement> Announcements {get; set;} = null!;
    public DbSet<AnnouncementRecipient> AnnouncementRecipients {get;set;} = null!;
    public DbSet<Complaint> Complaints {get;set;} = null!;
    public DbSet<Invoice> Invoices { get; set; } = null!;
    public DbSet<Payment> Payments { get; set; } = null!;

   
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Configure Identity tables first.
    base.OnModelCreating(modelBuilder);

    // Link each staff profile to its login account.
    modelBuilder.Entity<Staff>()
        .HasOne<ApplicationUser>()
        .WithOne()
        .HasForeignKey<Staff>(s => s.ApplicationUserId)
        .IsRequired(false)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Staff>()
        .HasIndex(s => s.ApplicationUserId)
        .IsUnique();

    // Link each parent profile to its login account.
    modelBuilder.Entity<Parent>()
        .HasOne<ApplicationUser>()
        .WithOne()
        .HasForeignKey<Parent>(p => p.ApplicationUserId)
        .IsRequired(false)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Parent>()
        .HasIndex(p => p.ApplicationUserId)
        .IsUnique();

    // Preserve the existing ParentChild relationship.
    modelBuilder.Entity<ParentChild>()
        .HasKey(pc => new { pc.ParentId, pc.ChildId });

    modelBuilder.Entity<ParentChild>()
        .HasOne(pc => pc.Parent)
        .WithMany(p => p.ParentChildren)
        .HasForeignKey(pc => pc.ParentId);

    modelBuilder.Entity<ParentChild>()
        .HasOne(pc => pc.Child)
        .WithMany(c => c.ParentChildren)
        .HasForeignKey(pc => pc.ChildId);

    // Prevent duplicate attendance records for the same child/date.
    modelBuilder.Entity<ChildAttendance>()
        .HasIndex(a => new { a.ChildId, a.AttendanceDate })
        .IsUnique();

    // Prevent duplicate attendance records for the same staff/date.
    modelBuilder.Entity<StaffAttendance>()
        .HasIndex(a => new { a.StaffId, a.AttendanceDate })
        .IsUnique();
        
    // Configure invoices.
    modelBuilder.Entity<Invoice>()
        .Property(i => i.Amount)
        .HasPrecision(18, 2);

    modelBuilder.Entity<Invoice>()
        .Property(i => i.Status)
        .HasConversion<string>();

    modelBuilder.Entity<Invoice>()
        .HasOne(i => i.Child)
        .WithMany()
        .HasForeignKey(i => i.ChildId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Invoice>()
        .HasOne(i => i.Parent)
        .WithMany()
        .HasForeignKey(i => i.ParentId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Invoice>()
        .HasIndex(i => new { i.ParentId, i.Status });

    // Configure payments.
    modelBuilder.Entity<Payment>()
        .Property(p => p.Amount)
        .HasPrecision(18, 2);

    modelBuilder.Entity<Payment>()
        .Property(p => p.Method)
        .HasConversion<string>();

    modelBuilder.Entity<Payment>()
        .Property(p => p.Status)
        .HasConversion<string>();

    modelBuilder.Entity<Payment>()
        .HasOne(p => p.Invoice)
        .WithMany(i => i.Payments)
        .HasForeignKey(p => p.InvoiceId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Payment>()
        .HasIndex(p => p.TransactionReference)
        .IsUnique()
        .HasFilter("\"TransactionReference\" IS NOT NULL");
}

}
