
using Daycare.Api.Data;
using Daycare.Api.Features.Children.Commands;
using Daycare.Api.Models;
using MediatR;

namespace Daycare.Api.Features.Children.Handlers;

public class CreateChildCommandHandler
    : IRequestHandler<CreateChildCommand, Child>
{
    private readonly DaycareDbContext _context;

    public CreateChildCommandHandler(DaycareDbContext context)
    {
        _context = context;
    }

    public async Task<Child> Handle(
        CreateChildCommand request,
        CancellationToken cancellationToken)
    {
        _context.Children.Add(request.Child);

        await _context.SaveChangesAsync(cancellationToken);

        return request.Child;
    }
}
